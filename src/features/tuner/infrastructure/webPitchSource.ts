import type { PitchListener, PitchSource } from "../application/pitchSource";
import { AutocorrelationPitchDetector } from "./pitchDetector";

type BrowserAudioContext = AudioContext & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

export class WebPitchSource implements PitchSource {
  private stream: MediaStream | null = null;
  private context: BrowserAudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private animationFrame: number | null = null;
  private samples: Float32Array<ArrayBuffer> | null = null;
  private running = false;
  private generation = 0;
  private readonly detector = new AutocorrelationPitchDetector();
  private lastAnalysisTime = 0;

  async start(listener: PitchListener): Promise<void> {
    if (this.running) return;
    const generation = ++this.generation;
    if (
      !navigator.mediaDevices?.getUserMedia ||
      !("AudioContext" in window || "webkitAudioContext" in window)
    ) {
      throw new Error("UNSUPPORTED_AUDIO");
    }

    const AudioContextConstructor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) throw new Error("UNSUPPORTED_AUDIO");

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      if (generation !== this.generation) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
        return;
      }
      this.context = new AudioContextConstructor();
      await this.context.resume();
      if (generation !== this.generation) return;
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 4_096;
      this.analyser.smoothingTimeConstant = 0;
      this.samples = new Float32Array(this.analyser.fftSize);
      this.source = this.context.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
      this.running = true;

      const analyze = (timestamp: number) => {
        if (!this.running || !this.analyser || !this.context || !this.samples) return;
        if (timestamp - this.lastAnalysisTime >= 50) {
          this.lastAnalysisTime = timestamp;
          this.analyser.getFloatTimeDomainData(this.samples);
          listener(this.detector.detect(this.samples, this.context.sampleRate));
        }
        this.animationFrame = window.requestAnimationFrame(analyze);
      };
      this.animationFrame = window.requestAnimationFrame(analyze);
    } catch (error) {
      await this.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.generation += 1;
    this.running = false;
    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.source?.disconnect();
    this.analyser?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.source = null;
    this.analyser = null;
    this.samples = null;
    this.stream = null;
    const context = this.context;
    this.context = null;
    if (context && context.state !== "closed") await context.close();
  }
}

import type { PitchResult } from "../domain/pitchResult";
import { TunerEngine } from "../domain/tunerEngine";
import type { PitchListener, PitchSource } from "./pitchSource";

export type TunerPhase = "idle" | "listening" | "tuning" | "error";

export interface TunerState {
  readonly phase: TunerPhase;
  readonly pitch: PitchResult | null;
  readonly error: string | null;
}

export type TunerStateListener = (state: TunerState) => void;

export class TunerController {
  private state: TunerState = { phase: "idle", pitch: null, error: null };
  private readonly listeners = new Set<TunerStateListener>();
  private readonly engine = new TunerEngine();
  private starting = false;
  private generation = 0;

  constructor(private readonly pitchSource: PitchSource) {}

  getState(): TunerState {
    return this.state;
  }

  subscribe(listener: TunerStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  async start(): Promise<void> {
    if (this.starting || this.state.phase === "listening" || this.state.phase === "tuning") {
      return;
    }
    this.starting = true;
    const generation = ++this.generation;
    this.engine.reset();
    this.setState({ phase: "listening", pitch: null, error: null });
    const onPitch: PitchListener = (frequency) => {
      if (generation !== this.generation) return;
      if (this.state.phase !== "listening" && this.state.phase !== "tuning") return;
      const pitch = frequency === null ? null : this.engine.processFrequency(frequency);
      this.setState({
        phase: pitch ? "tuning" : "listening",
        pitch,
        error: null,
      });
    };

    try {
      await this.pitchSource.start(onPitch);
      if (generation !== this.generation) await this.pitchSource.stop();
    } catch (error) {
      if (generation !== this.generation) return;
      try {
        await this.pitchSource.stop();
      } catch {
        this.setState({
          phase: "error",
          pitch: null,
          error: "The microphone could not be released. Please reload the page.",
        });
        return;
      }
      this.engine.reset();
      this.setState({
        phase: "error",
        pitch: null,
        error: getAudioErrorMessage(error),
      });
    } finally {
      this.starting = false;
    }
  }

  async stop(): Promise<void> {
    this.generation += 1;
    this.starting = false;
    this.engine.reset();
    try {
      await this.pitchSource.stop();
    } catch {
      this.setState({
        phase: "error",
        pitch: null,
        error: "The microphone could not be stopped. Please reload the page.",
      });
      return;
    }
    this.setState({ phase: "idle", pitch: null, error: null });
  }

  private setState(state: TunerState): void {
    this.state = state;
    for (const listener of this.listeners) listener(state);
  }
}

function getAudioErrorMessage(error: unknown): string {
  if (error instanceof Error && error.name === "NotAllowedError") {
    return "Microphone access was denied. Allow microphone access and try again.";
  }
  if (error instanceof Error && error.name === "NotFoundError") {
    return "No microphone was found. Connect a microphone and try again.";
  }
  if (error instanceof Error && error.message === "UNSUPPORTED_AUDIO") {
    return "Microphone audio is not supported in this browser.";
  }
  if (error instanceof Error && error.name === "NotReadableError") {
    return "The microphone is unavailable. Close other apps using it and try again.";
  }
  return "Could not start the microphone. Check your browser permissions and try again.";
}

import { frequencyToMidi, midiToFrequency, midiToNote } from "./note";
import type { PitchResult } from "./pitchResult";
import { getTuningStatus } from "./tuningStatus";

export const MIN_TUNABLE_FREQUENCY = 20;
export const MAX_TUNABLE_FREQUENCY = 5_000;
const SMOOTHING_FACTOR = 0.35;

export class TunerEngine {
  private smoothedFrequency: number | null = null;
  private previousMidi: number | null = null;

  processFrequency(frequency: number): PitchResult | null {
    if (
      !Number.isFinite(frequency) ||
      frequency < MIN_TUNABLE_FREQUENCY ||
      frequency > MAX_TUNABLE_FREQUENCY
    ) {
      return null;
    }

    const midi = frequencyToMidi(frequency);
    if (this.previousMidi !== midi || this.smoothedFrequency === null) {
      this.smoothedFrequency = frequency;
    } else {
      this.smoothedFrequency +=
        (frequency - this.smoothedFrequency) * SMOOTHING_FACTOR;
    }
    this.previousMidi = midi;

    const targetFrequency = midiToFrequency(midi);
    const cents = 1200 * Math.log2(this.smoothedFrequency / targetFrequency);
    return {
      note: midiToNote(midi),
      frequency: this.smoothedFrequency,
      targetFrequency,
      cents,
      tuningStatus: getTuningStatus(cents),
    };
  }

  reset(): void {
    this.smoothedFrequency = null;
    this.previousMidi = null;
  }
}

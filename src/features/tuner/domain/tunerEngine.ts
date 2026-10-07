import {
  frequencyToMidi,
  isValidReferenceFrequency,
  midiToFrequency,
  midiToNote,
  REFERENCE_FREQUENCY,
} from "./note";
import type { PitchResult } from "./pitchResult";
import { getTuningStatus } from "./tuningStatus";

export const MIN_TUNABLE_FREQUENCY = 20;
export const MAX_TUNABLE_FREQUENCY = 5_000;
const SMOOTHING_FACTOR = 0.35;

export class TunerEngine {
  private smoothedFrequency: number | null = null;
  private previousMidi: number | null = null;

  constructor(private referenceFrequency = REFERENCE_FREQUENCY) {
    if (!isValidReferenceFrequency(referenceFrequency)) {
      throw new RangeError("Reference frequency must be from 1 to 1000 Hz.");
    }
  }

  setReferenceFrequency(frequency: number): void {
    if (!isValidReferenceFrequency(frequency)) {
      throw new RangeError("Reference frequency must be from 1 to 1000 Hz.");
    }
    this.referenceFrequency = frequency;
    this.reset();
  }

  processFrequency(frequency: number): PitchResult | null {
    if (
      !Number.isFinite(frequency) ||
      frequency < MIN_TUNABLE_FREQUENCY ||
      frequency > MAX_TUNABLE_FREQUENCY
    ) {
      return null;
    }

    const midi = frequencyToMidi(frequency, this.referenceFrequency);
    if (midi < 0 || midi > 127) return null;
    if (this.previousMidi !== midi || this.smoothedFrequency === null) {
      this.smoothedFrequency = frequency;
    } else {
      this.smoothedFrequency +=
        (frequency - this.smoothedFrequency) * SMOOTHING_FACTOR;
    }
    this.previousMidi = midi;

    const targetFrequency = midiToFrequency(midi, this.referenceFrequency);
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

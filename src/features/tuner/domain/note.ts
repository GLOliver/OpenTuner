export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export const REFERENCE_FREQUENCY = 440;
export const REFERENCE_MIDI_NOTE = 69;
export const MIN_REFERENCE_FREQUENCY = 1;
export const MAX_REFERENCE_FREQUENCY = 1_000;

export function isValidReferenceFrequency(frequency: number): boolean {
  return (
    Number.isFinite(frequency) &&
    frequency >= MIN_REFERENCE_FREQUENCY &&
    frequency <= MAX_REFERENCE_FREQUENCY
  );
}

export interface MusicalNote {
  readonly midi: number;
  readonly name: NoteName;
  readonly octave: number;
}

export function frequencyToMidi(
  frequency: number,
  referenceFrequency = REFERENCE_FREQUENCY,
): number {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    throw new RangeError("Frequency must be a finite positive number.");
  }
  if (!isValidReferenceFrequency(referenceFrequency)) {
    throw new RangeError("Reference frequency must be from 1 to 1000 Hz.");
  }
  return Math.round(
    REFERENCE_MIDI_NOTE + 12 * Math.log2(frequency / referenceFrequency),
  );
}

export function midiToFrequency(
  midi: number,
  referenceFrequency = REFERENCE_FREQUENCY,
): number {
  if (!Number.isFinite(midi)) {
    throw new RangeError("MIDI note must be a finite number.");
  }
  if (!isValidReferenceFrequency(referenceFrequency)) {
    throw new RangeError("Reference frequency must be from 1 to 1000 Hz.");
  }
  return referenceFrequency * 2 ** ((midi - REFERENCE_MIDI_NOTE) / 12);
}

export function midiToNote(midi: number): MusicalNote {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) {
    throw new RangeError("MIDI note must be an integer from 0 to 127.");
  }
  return {
    midi,
    name: NOTE_NAMES[midi % NOTE_NAMES.length],
    octave: Math.floor(midi / NOTE_NAMES.length) - 1,
  };
}

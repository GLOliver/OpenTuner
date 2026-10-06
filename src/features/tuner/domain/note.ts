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

export interface MusicalNote {
  readonly midi: number;
  readonly name: NoteName;
  readonly octave: number;
}

export function frequencyToMidi(frequency: number): number {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    throw new RangeError("Frequency must be a finite positive number.");
  }
  return Math.round(
    REFERENCE_MIDI_NOTE + 12 * Math.log2(frequency / REFERENCE_FREQUENCY),
  );
}

export function midiToFrequency(midi: number): number {
  if (!Number.isFinite(midi)) {
    throw new RangeError("MIDI note must be a finite number.");
  }
  return REFERENCE_FREQUENCY * 2 ** ((midi - REFERENCE_MIDI_NOTE) / 12);
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

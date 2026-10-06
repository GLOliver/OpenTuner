import { describe, expect, it } from "vitest";
import {
  frequencyToMidi,
  midiToFrequency,
  midiToNote,
} from "./note";
import { getTuningStatus, IN_TUNE_TOLERANCE_CENTS } from "./tuningStatus";
import { TunerEngine } from "./tunerEngine";

describe("chromatic note calculations", () => {
  it.each([
    [440, "A", 4],
    [220, "A", 3],
    [880, "A", 5],
    [261.63, "C", 4],
    [329.63, "E", 4],
  ])("%i Hz resolves to %s%i", (frequency, name, octave) => {
    const note = midiToNote(frequencyToMidi(frequency));
    expect(note.name).toBe(name);
    expect(note.octave).toBe(octave);
  });

  it("calculates target frequencies using equal temperament", () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(57)).toBe(220);
    expect(midiToFrequency(60)).toBeCloseTo(261.6256, 3);
  });

  it("rejects invalid frequencies and MIDI notes", () => {
    for (const frequency of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => frequencyToMidi(frequency)).toThrow(RangeError);
    }
    expect(() => midiToNote(128)).toThrow(RangeError);
    expect(() => midiToNote(60.5)).toThrow(RangeError);
  });
});

describe("tuning status", () => {
  it("classifies flat, in-tune boundaries, and sharp pitches", () => {
    expect(getTuningStatus(-5.01)).toBe("flat");
    expect(getTuningStatus(-IN_TUNE_TOLERANCE_CENTS)).toBe("inTune");
    expect(getTuningStatus(0)).toBe("inTune");
    expect(getTuningStatus(IN_TUNE_TOLERANCE_CENTS)).toBe("inTune");
    expect(getTuningStatus(5.01)).toBe("sharp");
    expect(() => getTuningStatus(Number.NaN)).toThrow(RangeError);
  });
});

describe("TunerEngine", () => {
  it("reports reference, sharp, and flat measurements", () => {
    const reference = new TunerEngine().processFrequency(440);
    expect(reference?.note).toMatchObject({ name: "A", octave: 4 });
    expect(reference?.cents).toBeCloseTo(0);
    expect(reference?.tuningStatus).toBe("inTune");

    const sharp = new TunerEngine().processFrequency(442);
    expect(sharp?.note).toMatchObject({ name: "A", octave: 4 });
    expect(sharp?.cents).toBeGreaterThan(0);
    expect(sharp?.tuningStatus).toBe("sharp");

    const flat = new TunerEngine().processFrequency(438);
    expect(flat?.note).toMatchObject({ name: "A", octave: 4 });
    expect(flat?.cents).toBeLessThan(0);
    expect(flat?.tuningStatus).toBe("flat");
  });

  it("rejects out-of-range measurements and resets smoothing", () => {
    const engine = new TunerEngine();
    expect(engine.processFrequency(0)).toBeNull();
    expect(engine.processFrequency(8_000)).toBeNull();
    expect(engine.processFrequency(Number.NaN)).toBeNull();
    engine.processFrequency(440);
    engine.reset();
    expect(engine.processFrequency(442)?.frequency).toBe(442);
  });
});

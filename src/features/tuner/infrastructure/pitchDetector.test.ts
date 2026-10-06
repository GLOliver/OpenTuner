import { describe, expect, it } from "vitest";
import { AutocorrelationPitchDetector } from "./pitchDetector";

function createTone(frequency: number, sampleRate = 48_000): Float32Array {
  return Float32Array.from({ length: 4_096 }, (_, index) =>
    0.4 * Math.sin((2 * Math.PI * frequency * index) / sampleRate),
  );
}

describe("AutocorrelationPitchDetector", () => {
  const detector = new AutocorrelationPitchDetector();

  it.each([82.4, 110, 220, 440, 880])(
    "estimates a clear %s Hz fundamental frequency",
    (frequency) => {
      expect(detector.detect(createTone(frequency), 48_000)).toBeCloseTo(
        frequency,
        0,
      );
    },
  );

  it("rejects silence and invalid sample rates", () => {
    expect(detector.detect(new Float32Array(4_096), 48_000)).toBeNull();
    expect(detector.detect(createTone(440), 0)).toBeNull();
  });
});

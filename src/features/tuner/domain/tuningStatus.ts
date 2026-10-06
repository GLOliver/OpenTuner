export const IN_TUNE_TOLERANCE_CENTS = 5;

export type TuningStatus = "flat" | "inTune" | "sharp";

export function getTuningStatus(cents: number): TuningStatus {
  if (!Number.isFinite(cents)) {
    throw new RangeError("Cents deviation must be finite.");
  }
  if (cents < -IN_TUNE_TOLERANCE_CENTS) return "flat";
  if (cents > IN_TUNE_TOLERANCE_CENTS) return "sharp";
  return "inTune";
}

import type { MusicalNote } from "./note";
import type { TuningStatus } from "./tuningStatus";

export interface PitchResult {
  readonly note: MusicalNote;
  readonly frequency: number;
  readonly targetFrequency: number;
  readonly cents: number;
  readonly tuningStatus: TuningStatus;
}

export type PitchListener = (frequency: number | null) => void;

export interface PitchSource {
  start(listener: PitchListener): Promise<void>;
  stop(): Promise<void>;
}

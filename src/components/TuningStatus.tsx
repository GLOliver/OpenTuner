import { IN_TUNE_TOLERANCE_CENTS } from "../features/tuner/domain/tuningStatus";

interface TuningStatusProps {
  cents: number | null;
  status: "flat" | "inTune" | "sharp" | null;
}

const STATUS_LABELS = {
  flat: "FLAT",
  inTune: "IN TUNE",
  sharp: "SHARP",
} as const;

export function TuningStatus({ cents, status }: TuningStatusProps) {
  const formattedCents =
    cents === null ? "-- cents" : `${cents > 0 ? "+" : ""}${Math.round(cents)} cents`;
  return (
    <div className={`tuning-status tuning-status--${status ?? "idle"}`}>
      <span className="tuning-status__cents" aria-live="polite" aria-atomic="true">
        {formattedCents}
      </span>
      <span className="tuning-status__label" role="status">
        {status ? STATUS_LABELS[status] : " "}
      </span>
      <span className="sr-only">
        In tune tolerance is plus or minus {IN_TUNE_TOLERANCE_CENTS} cents.
      </span>
    </div>
  );
}

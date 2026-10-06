import { REFERENCE_FREQUENCY } from "../features/tuner/domain/note";

interface FrequencyDisplayProps {
  frequency: number | null;
}

export function FrequencyDisplay({ frequency }: FrequencyDisplayProps) {
  return (
    <div className="frequency-display">
      <div className="frequency-display__reading" aria-live="polite" aria-atomic="true">
        <span className="eyebrow">FREQUENCY</span>
        <span className="frequency-display__value">
          {frequency === null ? "--" : frequency.toFixed(1)}
          <span> Hz</span>
        </span>
      </div>
      <div className="frequency-display__reference">
        <span className="eyebrow">REFERENCE</span>
        <span className="frequency-display__reference-value">
          {REFERENCE_FREQUENCY} Hz
        </span>
      </div>
    </div>
  );
}

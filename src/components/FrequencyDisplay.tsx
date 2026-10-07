interface FrequencyDisplayProps {
  frequency: number | null;
  referenceFrequency: number;
  onEditReference: () => void;
}

export function FrequencyDisplay({
  frequency,
  referenceFrequency,
  onEditReference,
}: FrequencyDisplayProps) {
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
        <button
          className="frequency-display__reference-value"
          type="button"
          onClick={onEditReference}
          aria-label={`Edit reference frequency, currently ${referenceFrequency} hertz`}
        >
          {referenceFrequency} Hz
        </button>
      </div>
    </div>
  );
}

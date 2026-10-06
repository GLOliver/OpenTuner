interface TunerButtonProps {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function TunerButton({ active, disabled = false, onClick }: TunerButtonProps) {
  return (
    <button
      className={`tuner-button${active ? " tuner-button--active" : ""}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={active ? "Stop tuner and release microphone" : "Start tuner and enable microphone"}
    >
      <span className="tuner-button__icon" aria-hidden="true">
        {active ? <span className="tuner-button__stop" /> : <span className="tuner-button__play" />}
      </span>
      {active ? "STOP" : "START"}
    </button>
  );
}

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  MAX_REFERENCE_FREQUENCY,
  MIN_REFERENCE_FREQUENCY,
} from "../features/tuner/domain/note";

interface ReferenceFrequencyModalProps {
  frequency: number;
  onCancel: () => void;
  onConfirm: (frequency: number) => void;
}

export function ReferenceFrequencyModal({
  frequency,
  onCancel,
  onConfirm,
}: ReferenceFrequencyModalProps) {
  const [value, setValue] = useState(String(frequency));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    const previousFocus = document.activeElement;
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancelRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFrequency = Number(value);
    if (
      value.trim() === "" ||
      !Number.isFinite(nextFrequency) ||
      nextFrequency < MIN_REFERENCE_FREQUENCY ||
      nextFrequency > MAX_REFERENCE_FREQUENCY
    ) {
      setError(
        `Enter a frequency from ${MIN_REFERENCE_FREQUENCY} to ${MAX_REFERENCE_FREQUENCY} Hz.`,
      );
      return;
    }
    onConfirm(nextFrequency);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="reference-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reference-modal-title"
        aria-describedby="reference-modal-description"
      >
        <span className="eyebrow">TUNING CALIBRATION</span>
        <h2 id="reference-modal-title">Reference frequency</h2>
        <p id="reference-modal-description">
          Set the frequency for A4. Choose a value between{" "}
          {MIN_REFERENCE_FREQUENCY} and {MAX_REFERENCE_FREQUENCY} Hz.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="reference-modal__label" htmlFor="reference-frequency">
            A4 REFERENCE <span>(Hz)</span>
          </label>
          <input
            ref={inputRef}
            id="reference-frequency"
            className="reference-modal__input"
            type="number"
            inputMode="decimal"
            min={MIN_REFERENCE_FREQUENCY}
            max={MAX_REFERENCE_FREQUENCY}
            step="any"
            required
            value={value}
            aria-invalid={error !== null}
            aria-describedby={error ? "reference-frequency-error" : undefined}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
          />
          {error && (
            <p className="reference-modal__error" id="reference-frequency-error" role="alert">
              {error}
            </p>
          )}
          <div className="reference-modal__actions">
            <button
              className="reference-modal__cancel"
              type="button"
              onClick={onCancel}
            >
              CANCEL
            </button>
            <button className="tuner-button reference-modal__confirm" type="submit">
              CONFIRM
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

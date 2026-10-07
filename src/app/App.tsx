import { useMemo, useState } from "react";
import { FrequencyDisplay } from "../components/FrequencyDisplay";
import { NoteDisplay } from "../components/NoteDisplay";
import { ReferenceFrequencyModal } from "../components/ReferenceFrequencyModal";
import { TunerButton } from "../components/TunerButton";
import { TunerGauge } from "../components/TunerGauge";
import { TuningStatus } from "../components/TuningStatus";
import { TunerController } from "../features/tuner/application/tunerController";
import { REFERENCE_FREQUENCY } from "../features/tuner/domain/note";
import { WebPitchSource } from "../features/tuner/infrastructure/webPitchSource";
import { useTuner } from "../hooks/useTuner";
import "./app.css";

interface AppProps {
  controller?: TunerController;
}

export function App({ controller: providedController }: AppProps) {
  const defaultController = useMemo(
    () => new TunerController(new WebPitchSource()),
    [],
  );
  const controller = providedController ?? defaultController;
  const { state, toggle } = useTuner(controller);
  const [referenceFrequency, setReferenceFrequency] =
    useState(REFERENCE_FREQUENCY);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const active = state.phase === "listening" || state.phase === "tuning";
  const pitch = state.pitch;

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1 className="brand-heading">
          <a className="brand" href="/">
            <span className="brand__mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>OpenTuner</span>
          </a>
        </h1>
        <span className="app-header__caption">CHROMATIC TUNER</span>
      </header>

      <section className="tuner-card" aria-label="Chromatic tuner">
        <div className="tuner-card__heading">
          <span className="eyebrow">PRECISION TUNING</span>
          <span
            className={`connection-indicator${active ? " connection-indicator--active" : ""}`}
          >
            <span />
            {active ? "LISTENING" : "READY"}
          </span>
        </div>

        <TunerGauge
          cents={pitch?.cents ?? null}
          status={pitch?.tuningStatus ?? null}
        />

        <NoteDisplay pitch={pitch} listening={state.phase === "listening"} />
        <TuningStatus
          cents={pitch?.cents ?? null}
          status={pitch?.tuningStatus ?? null}
        />

        <FrequencyDisplay
          frequency={pitch?.frequency ?? null}
          referenceFrequency={referenceFrequency}
          onEditReference={() => setIsReferenceModalOpen(true)}
        />

        {state.error && (
          <p className="error-message" role="alert">
            {state.error}
          </p>
        )}

        <TunerButton active={active} onClick={toggle} />
        <p className="permission-hint">
          Use headphones or reduce background noise for best results.
        </p>
      </section>

      <footer className="app-footer">
        <span>SDG.</span>
        <span>
          A4 <span aria-hidden="true">·</span> {referenceFrequency} Hz
        </span>
      </footer>

      {isReferenceModalOpen && (
        <ReferenceFrequencyModal
          frequency={referenceFrequency}
          onCancel={() => setIsReferenceModalOpen(false)}
          onConfirm={(frequency) => {
            controller.setReferenceFrequency(frequency);
            setReferenceFrequency(frequency);
            setIsReferenceModalOpen(false);
          }}
        />
      )}
    </main>
  );
}

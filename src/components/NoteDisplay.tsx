import type { PitchResult } from "../features/tuner/domain/pitchResult";

interface NoteDisplayProps {
  pitch: PitchResult | null;
  listening: boolean;
}

export function NoteDisplay({ pitch, listening }: NoteDisplayProps) {
  if (!pitch) {
    return (
      <div className="note-display" aria-live="polite" aria-atomic="true">
        <span className="note-display__placeholder">--</span>
        <p className="note-display__prompt">
          {listening ? "Listening..." : "Play a note"}
        </p>
      </div>
    );
  }

  return (
    <div className="note-display" aria-live="polite" aria-atomic="true">
      <span className="note-display__letter">
        {pitch.note.name}
        <span className="note-display__octave">{pitch.note.octave}</span>
      </span>
      <p className="note-display__label">
        {pitch.note.name}
        {pitch.note.octave}
      </p>
    </div>
  );
}

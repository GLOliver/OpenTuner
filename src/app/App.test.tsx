import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PitchListener, PitchSource } from "../features/tuner/application/pitchSource";
import { TunerController } from "../features/tuner/application/tunerController";
import { App } from "./App";

class FakePitchSource implements PitchSource {
  listener: PitchListener | null = null;
  start = vi.fn(async (listener: PitchListener) => {
    this.listener = listener;
  });
  stop = vi.fn(async () => {
    this.listener = null;
  });

  emit(frequency: number | null): void {
    this.listener?.(frequency);
  }
}

function renderTuner(source = new FakePitchSource()) {
  const controller = new TunerController(source);
  return { ...render(<App controller={controller} />), controller, source };
}

describe("OpenTuner main screen", () => {
  it("renders a clean idle tuner with a start control", () => {
    renderTuner();
    expect(screen.getByRole("heading", { name: "OpenTuner" })).toBeInTheDocument();
    expect(screen.getByText("Play a note")).toBeInTheDocument();
    expect(screen.getByText("FREQUENCY").parentElement).toHaveTextContent("-- Hz");
    expect(screen.getByRole("button", { name: /start tuner/i })).toBeInTheDocument();
  });

  it("shows listening while waiting for a reliable pitch, then shows its readings", async () => {
    const { source } = renderTuner();
    fireEvent.click(screen.getByRole("button", { name: /start tuner/i }));
    expect(await screen.findByText("Listening...")).toBeInTheDocument();

    source.emit(440);
    expect(await screen.findByText("A4")).toBeInTheDocument();
    expect(screen.getByText("440.0")).toBeInTheDocument();
    expect(screen.getByText("0 cents")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("IN TUNE");
  });

  it.each([
    [432.2, "FLAT"],
    [440, "IN TUNE"],
    [442, "SHARP"],
  ])("communicates tuning status %s as %s", async (frequency, status) => {
    const { source } = renderTuner();
    fireEvent.click(screen.getByRole("button", { name: /start tuner/i }));
    source.emit(frequency);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(status));
  });

  it("stops the tuner and returns to idle", async () => {
    const { source } = renderTuner();
    fireEvent.click(screen.getByRole("button", { name: /start tuner/i }));
    expect(await screen.findByRole("button", { name: /stop tuner/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /stop tuner/i }));
    await waitFor(() => expect(screen.getByText("Play a note")).toBeInTheDocument());
    expect(source.stop).toHaveBeenCalled();
  });

  it("shows a helpful message when microphone permission is denied", async () => {
    const source = new FakePitchSource();
    source.start.mockRejectedValueOnce(
      Object.assign(new Error("permission denied"), { name: "NotAllowedError" }),
    );
    renderTuner(source);
    fireEvent.click(screen.getByRole("button", { name: /start tuner/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Microphone access was denied",
    );
  });
});

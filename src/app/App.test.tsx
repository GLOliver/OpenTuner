import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    act(() => source.emit(440));
    expect(await screen.findByText("A4")).toBeInTheDocument();
    expect(screen.getByText("440.0")).toBeInTheDocument();
    expect(screen.getByText("0 cents")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("IN TUNE");
  });

  it("holds the last detected note through brief gaps until the next pitch arrives", async () => {
    const { source } = renderTuner();
    fireEvent.click(screen.getByRole("button", { name: /start tuner/i }));
    act(() => source.emit(440));

    expect(await screen.findByText("440.0")).toBeInTheDocument();
    act(() => source.emit(null));
    expect(screen.getByText("A4")).toBeInTheDocument();
    expect(screen.getByText("440.0")).toBeInTheDocument();
    expect(screen.queryByText("Listening...")).not.toBeInTheDocument();

    act(() => source.emit(442));
    expect(screen.getByText("A4")).toBeInTheDocument();
    expect(Number.parseFloat(screen.getByText(/440\./).textContent ?? "")).toBeCloseTo(
      440.7,
      1,
    );
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

  it("opens the reference editor and updates the tuner when confirmed", async () => {
    const { source } = renderTuner();
    fireEvent.click(screen.getByRole("button", { name: /edit reference frequency/i }));

    const dialog = screen.getByRole("dialog", { name: "Reference frequency" });
    const input = screen.getByRole("spinbutton", { name: /a4 reference/i });
    expect(input).toHaveValue(440);
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "1000");

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(dialog).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /currently 440 hertz/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /start tuner/i }));
    source.emit(440);
    expect(await screen.findByText("0 cents")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /edit reference frequency/i }));
    fireEvent.change(screen.getByRole("spinbutton", { name: /a4 reference/i }), {
      target: { value: "442" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(screen.getByRole("button", { name: /currently 442 hertz/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("FLAT");
    expect(screen.getByText("-8 cents")).toBeInTheDocument();
  });

  it("closes the reference editor without changing the value when cancelled", () => {
    renderTuner();
    fireEvent.click(screen.getByRole("button", { name: /edit reference frequency/i }));
    fireEvent.change(screen.getByRole("spinbutton", { name: /a4 reference/i }), {
      target: { value: "450" },
    });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /currently 440 hertz/i })).toBeInTheDocument();
  });
});

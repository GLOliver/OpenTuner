import { useCallback, useEffect, useState } from "react";
import type { TunerController, TunerState } from "../features/tuner/application/tunerController";

export function useTuner(controller: TunerController) {
  const [state, setState] = useState<TunerState>(() => controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return () => {
      unsubscribe();
      void controller.stop();
    };
  }, [controller]);

  const toggle = useCallback(() => {
    if (state.phase === "listening" || state.phase === "tuning") {
      void controller.stop();
    } else {
      void controller.start();
    }
  }, [controller, state.phase]);

  return { state, toggle };
}

import { create } from "zustand";

/**
 * Cross-component lesson playback state (Zustand per ARCHITECTURE.md — shared
 * between the control bar, the 3D viewport, and the MDX <Step> blocks).
 * Scoped to a single lesson page; reset on mount.
 */
interface LessonState {
  /** Index of the active guided step, synced with the scene's `activeStep`. */
  activeStep: number;
  stepCount: number;
  setActiveStep: (step: number) => void;
  setStepCount: (count: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: (stepCount: number) => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  activeStep: 0,
  stepCount: 0,
  setActiveStep: (step) =>
    set((s) => ({ activeStep: clamp(step, s.stepCount) })),
  setStepCount: (count) => set({ stepCount: count }),
  nextStep: () => set((s) => ({ activeStep: clamp(s.activeStep + 1, s.stepCount) })),
  prevStep: () => set((s) => ({ activeStep: clamp(s.activeStep - 1, s.stepCount) })),
  reset: (stepCount) => set({ activeStep: 0, stepCount }),
}));

function clamp(step: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(step, count - 1));
}

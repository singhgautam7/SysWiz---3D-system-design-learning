"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Scene } from "@/scenes/_engine/schema";
import { useLessonStore } from "@/store/lesson";
import { usePreferences } from "@/store/preferences";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { Segmented } from "./Segmented";

// Lazy-load the renderer (and all of Three.js) only on the lesson page, client-side.
const SceneRenderer = dynamic(
  () => import("@/scenes/_engine/SceneRenderer").then((m) => m.SceneRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-surface">
        <span className="font-mono text-[11px] text-muted-fg">Loading scene…</span>
      </div>
    ),
  },
);

export interface SceneVariant {
  label: string;
  scene: Scene;
}

/**
 * Lesson chrome around the generic SceneRenderer: a variant switcher (e.g.
 * "scale out" vs "scale up"), a guided-step navigator synced to the shared
 * lesson store, and a reduced-motion play gate. All lesson-specific controls
 * live here — the renderer stays generic.
 */
export function Scene3DViewport({
  variants,
  slug,
}: {
  variants: SceneVariant[];
  slug?: string;
}) {
  const [variantIndex, setVariantIndex] = useState(0);
  const setLessonProgress = usePreferences((s) => s.setProgress);
  const prefersReduced = usePrefersReducedMotion();
  const [playOverride, setPlayOverride] = useState(false);
  const reducedMotion = prefersReduced && !playOverride;

  const activeStep = useLessonStore((s) => s.activeStep);
  const setActiveStep = useLessonStore((s) => s.setActiveStep);
  const nextStep = useLessonStore((s) => s.nextStep);
  const prevStep = useLessonStore((s) => s.prevStep);
  const reset = useLessonStore((s) => s.reset);

  const current = variants[variantIndex] ?? variants[0]!;
  const steps = current.scene.steps ?? [];
  const hasSteps = steps.length > 0;

  // The stepper spans the richest variant so the MDX <Step> wiring is stable.
  const maxSteps = useMemo(
    () => Math.max(...variants.map((v) => v.scene.steps?.length ?? 0), 0),
    [variants],
  );

  useEffect(() => {
    reset(maxSteps);
  }, [reset, maxSteps]);

  // Advancing through the guided steps records lesson progress.
  useEffect(() => {
    if (!slug || maxSteps <= 0) return;
    setLessonProgress(slug, ((activeStep + 1) / maxSteps) * 100);
  }, [slug, activeStep, maxSteps, setLessonProgress]);

  const stepForScene = hasSteps ? Math.min(activeStep, steps.length - 1) : undefined;
  const caption = stepForScene != null ? steps[stepForScene]?.caption : undefined;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border-2 bg-black">
      <div className="relative h-[300px] w-full md:h-[500px]">
        <SceneRenderer
          scene={current.scene}
          activeStep={stepForScene}
          reducedMotion={reducedMotion}
        />
        {reducedMotion && (
          <button
            onClick={() => setPlayOverride(true)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-emerald/40 bg-surface-2/90 px-3 py-1.5 font-mono text-[11px] text-emerald backdrop-blur"
          >
            ▶ Play motion
          </button>
        )}
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface px-3 py-2.5">
        {variants.length > 1 && (
          <Segmented
            label="Scaling mode"
            value={String(variantIndex)}
            onChange={(v) => setVariantIndex(Number(v))}
            options={variants.map((variant, i) => ({
              label: variant.label,
              value: String(i),
            }))}
          />
        )}

        {hasSteps && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevStep}
              disabled={activeStep <= 0}
              aria-label="Previous step"
              className="grid h-9 w-9 place-items-center rounded-md border border-border-2 bg-surface font-mono text-text-2 transition-colors hover:border-border-3 disabled:opacity-40"
            >
              ‹
            </button>
            <span className="min-w-[52px] text-center font-mono text-[11px] text-muted-fg">
              {(stepForScene ?? 0) + 1} / {steps.length}
            </span>
            <button
              onClick={nextStep}
              disabled={activeStep >= maxSteps - 1}
              aria-label="Next step"
              className="grid h-9 w-9 place-items-center rounded-md border border-border-2 bg-surface font-mono text-text-2 transition-colors hover:border-border-3 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {caption && (
        <p className="border-t border-border bg-surface-2/50 px-3 py-2 font-mono text-[11px] leading-relaxed text-text-2">
          <button
            className="text-left"
            onClick={() => setActiveStep(stepForScene ?? 0)}
          >
            {caption}
          </button>
        </p>
      )}
    </div>
  );
}

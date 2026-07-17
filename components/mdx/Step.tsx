"use client";

import type { ReactNode } from "react";
import { useLessonStore } from "@/store/lesson";
import { cn } from "@/lib/utils";

/**
 * A numbered walkthrough step. Highlights when it matches the active guided
 * step (shared via the lesson store), and clicking it drives `activeStep` —
 * this is the wiring between the MDX body and the scene's `activeStep`.
 */
export function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  const activeStep = useLessonStore((s) => s.activeStep);
  const setActiveStep = useLessonStore((s) => s.setActiveStep);
  const active = activeStep === n - 1;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setActiveStep(n - 1)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setActiveStep(n - 1);
        }
      }}
      className={cn(
        "my-4 cursor-pointer rounded-lg border bg-surface-2/40 p-4 transition-colors",
        active
          ? "border-emerald/50 bg-emerald/[0.06]"
          : "border-border hover:border-border-3",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "grid h-5 w-5 place-items-center rounded-full font-mono text-[11px] font-semibold",
            active ? "bg-emerald text-[#001910]" : "bg-surface-3 text-text-2",
          )}
        >
          {n}
        </span>
        <span className="text-[14px] font-semibold text-text">{title}</span>
      </div>
      <div className="text-[13px] leading-relaxed text-text-2 [&_strong]:text-text [&>p]:m-0 [&>p+p]:mt-2">
        {children}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { Dimension, Difficulty } from "@/lib/content/schema";

/** 2D/3D dimension badge. Colour + text label (never colour alone). */
export function DimensionBadge({
  dimension,
  className,
}: {
  dimension: Dimension;
  className?: string;
}) {
  const is3d = dimension === "3d";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
        is3d
          ? "border-emerald/30 bg-emerald/10 text-emerald"
          : "border-[#B48BFF]/30 bg-[#B48BFF]/10 text-[#B48BFF]",
        className,
      )}
    >
      {is3d ? "3D · Interactive" : "2D · Animated"}
    </span>
  );
}

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  beginner: "border-emerald/30 text-emerald",
  intermediate: "border-[#FFB84D]/30 text-[#FFB84D]",
  advanced: "border-[#FF5A6A]/30 text-[#FF5A6A]",
};

export function DifficultyPill({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border bg-surface-2 px-2 py-0.5 font-mono text-[10px] capitalize",
        DIFFICULTY_STYLE[difficulty],
        className,
      )}
    >
      {difficulty}
    </span>
  );
}

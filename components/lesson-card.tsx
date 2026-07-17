"use client";

import Link from "next/link";
import type { LessonSummary } from "@/lib/content/load";
import { lessonHref } from "@/lib/content/routes";
import { usePreferences } from "@/store/preferences";
import { useHydrated } from "@/lib/use-hydrated";
import { DimensionBadge, DifficultyPill } from "./badges";
import { LessonPreview } from "./lesson-preview";
import { FavoriteButton } from "./favorite-button";

export function LessonCard({ lesson }: { lesson: LessonSummary }) {
  const { frontmatter: fm } = lesson;
  const href = lessonHref(lesson.category, lesson.slug);
  const progress = usePreferences((s) => s.progress[lesson.slug]);
  const hydrated = useHydrated();
  const pct = hydrated && progress ? progress.percent : 0;

  const cta =
    !hydrated || !progress
      ? "Start"
      : progress.completed
        ? "Review"
        : "Resume";

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border-2 bg-surface transition-all duration-150 hover:-translate-y-0.5 hover:border-border-3 hover:shadow-lg focus-visible:border-emerald"
    >
      <div className="relative">
        <LessonPreview dimension={fm.dimension} />
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <DimensionBadge dimension={fm.dimension} />
          <DifficultyPill difficulty={fm.difficulty} />
        </div>
        <FavoriteButton
          slug={lesson.slug}
          className="absolute right-1.5 top-1.5 bg-black/30 backdrop-blur"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {fm.subcategory && (
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-fg">
            {fm.subcategory}
          </span>
        )}
        <h3 className="text-[15px] font-semibold leading-snug text-text group-hover:text-emerald-2">
          {fm.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-text-2">{fm.summary}</p>

        <div className="mt-auto flex items-center gap-2 border-t border-border pt-3 font-mono text-[10px] text-muted-fg">
          {fm.estMinutes != null && <span>{formatDuration(fm.estMinutes)}</span>}
          {hydrated && progress && (
            <>
              <span aria-hidden>·</span>
              <span className={progress.completed ? "text-emerald" : "text-text-2"}>
                {pct}%
              </span>
            </>
          )}
          <span className="ml-auto text-emerald opacity-0 transition-opacity group-hover:opacity-100">
            {cta} →
          </span>
        </div>
      </div>

      {/* Progress ribbon (design §3). */}
      {hydrated && pct > 0 && (
        <div
          className="h-0.5 bg-emerald transition-[width]"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      )}
    </Link>
  );
}

export function formatDuration(minutes: number): string {
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

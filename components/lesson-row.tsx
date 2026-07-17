"use client";

import Link from "next/link";
import type { LessonSummary } from "@/lib/content/load";
import { lessonHref } from "@/lib/content/routes";
import { usePreferences } from "@/store/preferences";
import { useHydrated } from "@/lib/use-hydrated";
import { DimensionBadge, DifficultyPill } from "./badges";
import { FavoriteButton } from "./favorite-button";
import { formatDuration } from "./lesson-card";

/** List-view row (design §3 List view). */
export function LessonRow({ lesson }: { lesson: LessonSummary }) {
  const { frontmatter: fm } = lesson;
  const href = lessonHref(lesson.category, lesson.slug);
  const progress = usePreferences((s) => s.progress[lesson.slug]);
  const hydrated = useHydrated();
  const pct = hydrated && progress ? progress.percent : 0;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-border-2 bg-surface px-3 py-2.5 transition-colors hover:border-border-3 sm:gap-4 sm:px-4"
    >
      <DimensionBadge dimension={fm.dimension} className="hidden shrink-0 sm:inline-flex" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-text group-hover:text-emerald-2">
            {fm.title}
          </span>
          <DifficultyPill difficulty={fm.difficulty} className="hidden shrink-0 md:inline-flex" />
        </div>
        <span className="truncate text-[12px] text-muted-fg">{fm.summary}</span>
      </div>

      <span className="hidden shrink-0 font-mono text-[11px] text-muted-fg md:inline">
        {fm.subcategory}
      </span>
      {fm.estMinutes != null && (
        <span className="hidden shrink-0 font-mono text-[11px] text-muted-fg sm:inline">
          {formatDuration(fm.estMinutes)}
        </span>
      )}

      <div className="hidden h-1 w-16 shrink-0 overflow-hidden rounded-full bg-surface-2 lg:block">
        <div className="h-full bg-emerald" style={{ width: `${pct}%` }} aria-hidden />
      </div>

      <FavoriteButton slug={lesson.slug} size={24} className="shrink-0" />
    </Link>
  );
}

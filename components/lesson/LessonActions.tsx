"use client";

import { useEffect } from "react";
import { usePreferences } from "@/store/preferences";
import { useNotesUI } from "@/store/notes-ui";
import { useHydrated } from "@/lib/use-hydrated";
import { FavoriteButton } from "@/components/favorite-button";
import { NotesDrawer } from "./NotesDrawer";
import { cn } from "@/lib/utils";

/**
 * Lesson top-bar actions: favorite, notes, mark-complete. Marks the lesson as
 * "started" on mount so it appears under My progress.
 */
export function LessonActions({ slug, title }: { slug: string; title: string }) {
  const markStarted = usePreferences((s) => s.markStarted);
  const markCompleted = usePreferences((s) => s.markCompleted);
  const progress = usePreferences((s) => s.progress[slug]);
  const openDrawer = useNotesUI((s) => s.openDrawer);
  const open = useNotesUI((s) => s.open);
  const closeDrawer = useNotesUI((s) => s.closeDrawer);
  const hydrated = useHydrated();
  const completed = hydrated && progress?.completed;

  useEffect(() => {
    markStarted(slug);
  }, [markStarted, slug]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={openDrawer}
        className="flex min-h-[36px] items-center gap-1.5 rounded-md border border-border-2 bg-surface px-3 font-mono text-[11px] text-text-2 transition-colors hover:border-border-3 hover:text-text"
      >
        <NoteIcon /> Notes
      </button>
      <button
        onClick={() => markCompleted(slug)}
        aria-pressed={completed}
        className={cn(
          "min-h-[36px] rounded-md border px-3 font-mono text-[11px] transition-colors",
          completed
            ? "border-emerald/40 bg-emerald/10 text-emerald"
            : "border-border-2 bg-surface text-text-2 hover:border-border-3 hover:text-text",
        )}
      >
        {completed ? "✓ Completed" : "Mark complete"}
      </button>
      <FavoriteButton slug={slug} size={34} className="border-border-2 bg-surface" />

      <NotesDrawer
        key={open ? `open-${slug}` : "closed"}
        slug={slug}
        title={title}
        open={open}
        onClose={closeDrawer}
      />
    </div>
  );
}

function NoteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 3h9l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

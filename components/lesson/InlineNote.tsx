"use client";

import { useNotes } from "@/store/notes";
import { useNotesUI } from "@/store/notes-ui";
import { useLessonStore } from "@/store/lesson";
import { useHydrated } from "@/lib/use-hydrated";
import { renderMarkdown } from "@/lib/mini-markdown";

/**
 * The note for the current page/step, inlined into the explanation as a
 * subtle emerald-tinted card (design §6). Hidden when there's no note.
 */
export function InlineNote({ slug }: { slug: string }) {
  const activeStep = useLessonStore((s) => s.activeStep);
  const note = useNotes((s) => s.notes[slug]?.[activeStep]);
  const openDrawer = useNotesUI((s) => s.openDrawer);
  const hydrated = useHydrated();

  if (!hydrated || !note || !note.md.trim()) return null;

  const dateStr = new Date(note.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={openDrawer}
      className="my-6 cursor-pointer rounded-lg border border-emerald/20 bg-emerald/[0.04] p-4 hover:bg-emerald/[0.07] transition-colors group"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald">
          <span aria-hidden>✎</span>
          <span>your note · page {activeStep + 1}</span>
        </div>
        <span className="font-mono text-[10px] text-muted-fg group-hover:text-text-2 transition-colors">
          {dateStr}
        </span>
      </div>
      <div className="text-[13px] leading-relaxed text-text-2">
        {renderMarkdown(note.md)}
      </div>
    </div>
  );
}

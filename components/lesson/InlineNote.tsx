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

  return (
    <div className="my-6 rounded-lg border border-emerald/25 bg-emerald/[0.05] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-emerald">
          Your note · step {activeStep + 1}
        </p>
        <button
          onClick={openDrawer}
          className="font-mono text-[10px] text-muted-fg hover:text-text-2"
        >
          Edit
        </button>
      </div>
      <div className="text-[13px] leading-relaxed text-text-2">
        {renderMarkdown(note.md)}
      </div>
    </div>
  );
}

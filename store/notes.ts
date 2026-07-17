"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Note {
  md: string;
  updatedAt: number;
}

interface NotesState {
  /** Keyed by lesson slug, then page index (0-indexed step). */
  notes: Record<string, Record<number, Note>>;
  setNote: (slug: string, pageIdx: number, md: string) => void;
  clearNote: (slug: string, pageIdx: number) => void;
}

export const useNotes = create<NotesState>()(
  persist(
    (set) => ({
      notes: {},
      setNote: (slug, pageIdx, md) =>
        set((s) => {
          const lessonNotes = s.notes[slug] ?? {};
          return {
            notes: {
              ...s.notes,
              [slug]: {
                ...lessonNotes,
                [pageIdx]: { md, updatedAt: Date.now() },
              },
            },
          };
        }),
      clearNote: (slug, pageIdx) =>
        set((s) => {
          const lessonNotes = { ...s.notes[slug] };
          delete lessonNotes[pageIdx];
          return {
            notes: {
              ...s.notes,
              [slug]: lessonNotes,
            },
          };
        }),
    }),
    {
      name: "sysviz.notes",
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const oldNotes = (persistedState as { notes?: Record<string, unknown> })?.notes || {};
          const newNotes: Record<string, Record<number, Note>> = {};
          for (const [slug, note] of Object.entries(oldNotes)) {
            if (note && typeof note === "object" && "md" in note) {
              newNotes[slug] = {
                0: note as Note,
              };
            } else {
              newNotes[slug] = note as Record<number, Note>;
            }
          }
          return {
            ...(persistedState as Record<string, unknown>),
            notes: newNotes,
          };
        }
        return persistedState as NotesState;
      },
    },
  ),
);

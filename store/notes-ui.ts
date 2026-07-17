"use client";

import { create } from "zustand";

/** Ephemeral open-state for the single notes drawer on a lesson page. */
interface NotesUIState {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useNotesUI = create<NotesUIState>((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
}));

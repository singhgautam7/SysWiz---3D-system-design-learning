"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";
export type LibraryView = "grid" | "list";

export interface LessonProgress {
  /** 0–100. */
  percent: number;
  started: boolean;
  completed: boolean;
  updatedAt: number;
}

interface PreferencesState {
  theme: Theme;
  view: LibraryView;
  favorites: string[];
  progress: Record<string, LessonProgress>;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setView: (view: LibraryView) => void;

  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;

  markStarted: (slug: string) => void;
  setProgress: (slug: string, percent: number) => void;
  markCompleted: (slug: string) => void;
}

function applyThemeToDom(theme: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      view: "grid",
      favorites: [],
      progress: {},

      setTheme: (theme) => {
        applyThemeToDom(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        applyThemeToDom(next);
        set({ theme: next });
      },
      setView: (view) => set({ view }),

      toggleFavorite: (slug) =>
        set((s) => ({
          favorites: s.favorites.includes(slug)
            ? s.favorites.filter((f) => f !== slug)
            : [...s.favorites, slug],
        })),
      isFavorite: (slug) => get().favorites.includes(slug),

      markStarted: (slug) =>
        set((s) => {
          const cur = s.progress[slug];
          if (cur?.started) return s;
          return {
            progress: {
              ...s.progress,
              [slug]: {
                percent: cur?.percent ?? 5,
                started: true,
                completed: cur?.completed ?? false,
                updatedAt: Date.now(),
              },
            },
          };
        }),
      setProgress: (slug, percent) =>
        set((s) => {
          const clamped = Math.max(0, Math.min(100, Math.round(percent)));
          const cur = s.progress[slug];
          if (cur && cur.percent >= clamped && cur.completed) return s;
          return {
            progress: {
              ...s.progress,
              [slug]: {
                percent: Math.max(clamped, cur?.percent ?? 0),
                started: true,
                completed: cur?.completed || clamped >= 100,
                updatedAt: Date.now(),
              },
            },
          };
        }),
      markCompleted: (slug) =>
        set((s) => ({
          progress: {
            ...s.progress,
            [slug]: {
              percent: 100,
              started: true,
              completed: true,
              updatedAt: Date.now(),
            },
          },
        })),
    }),
    {
      name: "sysviz.prefs",
      // Persist data only; methods are recreated each load.
      partialize: (s) => ({
        theme: s.theme,
        view: s.view,
        favorites: s.favorites,
        progress: s.progress,
      }),
    },
  ),
);

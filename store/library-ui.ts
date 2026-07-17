"use client";

import { create } from "zustand";
import type { Category, Difficulty, Dimension } from "@/lib/content/schema";

export type CategoryFilter = "all" | Category;

interface LibraryUIState {
  query: string;
  category: CategoryFilter;
  difficulties: Difficulty[];
  dimensions: Dimension[];
  topics: string[];

  setQuery: (q: string) => void;
  setCategory: (c: CategoryFilter) => void;
  toggleDifficulty: (d: Difficulty) => void;
  toggleDimension: (d: Dimension) => void;
  toggleTopic: (t: string) => void;
  clearFilters: () => void;
}

export const useLibraryUI = create<LibraryUIState>((set) => ({
  query: "",
  category: "all",
  difficulties: [],
  dimensions: [],
  topics: [],

  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  toggleDifficulty: (d) =>
    set((s) => ({
      difficulties: s.difficulties.includes(d)
        ? s.difficulties.filter((x) => x !== d)
        : [...s.difficulties, d],
    })),
  toggleDimension: (d) =>
    set((s) => ({
      dimensions: s.dimensions.includes(d)
        ? s.dimensions.filter((x) => x !== d)
        : [...s.dimensions, d],
    })),
  toggleTopic: (t) =>
    set((s) => ({
      topics: s.topics.includes(t)
        ? s.topics.filter((x) => x !== t)
        : [...s.topics, t],
    })),
  clearFilters: () =>
    set({ difficulties: [], dimensions: [], topics: [], category: "all" }),
}));

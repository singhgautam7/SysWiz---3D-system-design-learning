"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LessonSummary } from "@/lib/content/load";
import type { Category, Difficulty, Dimension } from "@/lib/content/schema";
import { CATEGORY_LABEL } from "@/lib/content/routes";
import { useLibraryUI, type CategoryFilter } from "@/store/library-ui";
import { usePreferences } from "@/store/preferences";
import { useHydrated } from "@/lib/use-hydrated";
import { LessonCard } from "@/components/lesson-card";
import { LessonRow } from "@/components/lesson-row";
import { cn } from "@/lib/utils";

type Mode = "all" | "favorites" | "progress";

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];
const DIMENSIONS: Dimension[] = ["2d", "3d"];
const CATEGORY_ORDER: Category[] = ["concept", "system-design"];

const HERO: Record<Mode, { title: string; sub: string }> = {
  all: {
    title: "Library",
    sub: "Short, interactive lessons. Spatial systems as 3D scenes you can orbit. Comparisons and flows as animated 2D. No accounts, no autoplay.",
  },
  favorites: {
    title: "Favorites",
    sub: "Lessons you've starred. Saved locally in your browser.",
  },
  progress: {
    title: "My progress",
    sub: "Lessons you've started. Pick up where you left off.",
  },
};

export function LibraryClient({
  lessons,
  mode = "all",
}: {
  lessons: LessonSummary[];
  mode?: Mode;
}) {
  const hydrated = useHydrated();
  const favorites = usePreferences((s) => s.favorites);
  const progress = usePreferences((s) => s.progress);
  const view = usePreferences((s) => s.view);
  const setView = usePreferences((s) => s.setView);

  const {
    query,
    category,
    difficulties,
    dimensions,
    topics,
    setCategory,
    toggleDifficulty,
    toggleDimension,
    toggleTopic,
    clearFilters,
  } = useLibraryUI();

  const allTopics = useMemo(
    () =>
      [...new Set(lessons.map((l) => l.frontmatter.subcategory).filter(Boolean))].sort() as string[],
    [lessons],
  );

  // Base set for this screen (favorites/progress are localStorage-derived).
  const base = useMemo(() => {
    if (mode === "favorites") return lessons.filter((l) => favorites.includes(l.slug));
    if (mode === "progress") return lessons.filter((l) => progress[l.slug]?.started);
    return lessons;
  }, [mode, lessons, favorites, progress]);

  const counts = useMemo(
    () => ({
      all: base.length,
      concept: base.filter((l) => l.category === "concept").length,
      "system-design": base.filter((l) => l.category === "system-design").length,
    }),
    [base],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base
      .filter((l) => (category === "all" ? true : l.category === category))
      .filter((l) => (difficulties.length ? difficulties.includes(l.frontmatter.difficulty) : true))
      .filter((l) => (dimensions.length ? dimensions.includes(l.frontmatter.dimension) : true))
      .filter((l) =>
        topics.length ? topics.includes(l.frontmatter.subcategory ?? "") : true,
      )
      .filter((l) => {
        if (!q) return true;
        const fm = l.frontmatter;
        const hay = [fm.title, fm.summary, fm.subcategory, ...(fm.tags ?? [])]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort(
        (a, b) => b.frontmatter.updated.localeCompare(a.frontmatter.updated),
      );
  }, [base, category, difficulties, dimensions, topics, query]);

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        category: cat,
        lessons: filtered.filter((l) => l.category === cat),
      })).filter((g) => g.lessons.length > 0),
    [filtered],
  );

  const hasFilters =
    category !== "all" ||
    difficulties.length > 0 ||
    dimensions.length > 0 ||
    topics.length > 0 ||
    query.trim().length > 0;

  const hero = HERO[mode];

  // Favorites/progress need client data; render a stable shell until hydrated.
  const showEmpty = hydrated && filtered.length === 0;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <section className="mb-8 max-w-2xl">
        <h1 className="text-[26px] font-bold tracking-tight sm:text-[32px]">{hero.title}</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-text-2">{hero.sub}</p>
      </section>

      {/* Tabs + view toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-md border border-border-2 bg-surface p-0.5">
          {(["all", ...CATEGORY_ORDER] as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] transition-colors",
                category === cat ? "bg-surface-3 text-text" : "text-muted-fg hover:text-text-2",
              )}
            >
              {cat === "all" ? "All" : CATEGORY_LABEL[cat]}
              <span className="font-mono text-[10px] text-muted-fg">
                {cat === "all" ? counts.all : counts[cat]}
              </span>
            </button>
          ))}
        </div>

        <div className="inline-flex items-center rounded-md border border-border-2 bg-surface p-0.5">
          <ViewButton active={view === "grid"} onClick={() => setView("grid")} label="Grid view">
            <GridIcon />
          </ViewButton>
          <ViewButton active={view === "list"} onClick={() => setView("list")} label="List view">
            <ListIcon />
          </ViewButton>
        </div>
      </div>

      {/* Filter row */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-fg">Filter</span>

        {difficulties.map((d) => (
          <FilterPill key={d} label={d} onRemove={() => toggleDifficulty(d)} />
        ))}
        {dimensions.map((d) => (
          <FilterPill key={d} label={`${d.toUpperCase()} only`} onRemove={() => toggleDimension(d)} />
        ))}
        {topics.map((t) => (
          <FilterPill key={t} label={t} onRemove={() => toggleTopic(t)} />
        ))}

        <AddFilterMenu label="+ difficulty">
          {DIFFICULTIES.map((d) => (
            <MenuOption key={d} checked={difficulties.includes(d)} onClick={() => toggleDifficulty(d)}>
              {d}
            </MenuOption>
          ))}
        </AddFilterMenu>
        <AddFilterMenu label="+ type">
          {DIMENSIONS.map((d) => (
            <MenuOption key={d} checked={dimensions.includes(d)} onClick={() => toggleDimension(d)}>
              {d.toUpperCase()}
            </MenuOption>
          ))}
        </AddFilterMenu>
        {allTopics.length > 0 && (
          <AddFilterMenu label="+ topic">
            {allTopics.map((t) => (
              <MenuOption key={t} checked={topics.includes(t)} onClick={() => toggleTopic(t)}>
                {t}
              </MenuOption>
            ))}
          </AddFilterMenu>
        )}

        <span className="ml-auto font-mono text-[11px] text-muted-fg">
          {filtered.length} lesson{filtered.length === 1 ? "" : "s"} · sort:{" "}
          <span className="text-text-2">newest</span>
        </span>
      </div>

      {showEmpty ? (
        <EmptyState mode={mode} hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        grouped.map((group) => (
          <section key={group.category} className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-fg">
                {CATEGORY_LABEL[group.category]}
              </h2>
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[11px] text-muted-fg">
                {group.lessons.length} lesson{group.lessons.length === 1 ? "" : "s"}
              </span>
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.lessons.map((lesson) => (
                  <LessonCard key={lesson.slug} lesson={lesson} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {group.lessons.map((lesson) => (
                  <LessonRow key={lesson.slug} lesson={lesson} />
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </main>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid h-8 w-8 place-items-center rounded transition-colors",
        active ? "bg-surface-3 text-text" : "text-muted-fg hover:text-text-2",
      )}
    >
      {children}
    </button>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border-2 bg-surface-2 px-2 py-1 font-mono text-[11px] capitalize text-text-2">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="text-muted-fg hover:text-text">
        ×
      </button>
    </span>
  );
}

function AddFilterMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="rounded-md border border-dashed border-border-2 px-2 py-1 font-mono text-[11px] text-muted-fg transition-colors hover:border-border-3 hover:text-text-2"
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[140px] rounded-md border border-border-2 bg-surface-2 p-1 shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}

function MenuOption({
  checked,
  onClick,
  children,
}: {
  checked: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      role="menuitemcheckbox"
      aria-checked={checked}
      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-mono text-[11px] capitalize text-text-2 hover:bg-surface-3"
    >
      <span
        className={cn(
          "grid h-3.5 w-3.5 place-items-center rounded-sm border",
          checked ? "border-emerald bg-emerald text-[#001910]" : "border-border-3",
        )}
      >
        {checked && "✓"}
      </span>
      {children}
    </button>
  );
}

function EmptyState({
  mode,
  hasFilters,
  onClear,
}: {
  mode: Mode;
  hasFilters: boolean;
  onClear: () => void;
}) {
  const message =
    mode === "favorites"
      ? { head: "No favorites yet", sub: "Tap the heart on any lesson to save it here." }
      : mode === "progress"
        ? { head: "Nothing in progress yet", sub: "Open a lesson to start tracking your progress." }
        : { head: "No lessons match your filters", sub: "Try removing a filter or clearing your search." };

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-2 py-16 text-center">
      <div className="grid h-13 w-13 place-items-center rounded-md border border-dashed border-border-3 p-3 text-muted-fg">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 3" />
        </svg>
      </div>
      <p className="text-[15px] font-semibold text-text">{message.head}</p>
      <p className="max-w-xs text-[13px] text-muted-fg">{message.sub}</p>
      {mode === "all" && hasFilters && (
        <button
          onClick={onClear}
          className="mt-1 rounded-md border border-border-2 bg-surface px-3 py-1.5 font-mono text-[11px] text-text-2 hover:border-border-3"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

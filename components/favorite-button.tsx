"use client";

import { usePreferences } from "@/store/preferences";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

/**
 * Heart toggle persisted to localStorage (design §6 Favorites). Filled emerald
 * when active, outlined muted otherwise. Stops propagation so it works inside
 * clickable cards.
 */
export function FavoriteButton({
  slug,
  size = 28,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  const toggleFavorite = usePreferences((s) => s.toggleFavorite);
  const favorites = usePreferences((s) => s.favorites);
  const hydrated = useHydrated();
  const active = hydrated && favorites.includes(slug);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug);
      }}
      style={{ width: size, height: size }}
      className={cn(
        "grid place-items-center rounded-full border border-transparent text-muted-fg transition-colors hover:bg-surface-2 hover:text-text-2",
        active && "text-emerald hover:text-emerald",
        className,
      )}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        aria-hidden
      >
        <path
          d="M12 20.5 4.2 12.9a4.6 4.6 0 0 1 0-6.6 4.7 4.7 0 0 1 6.6 0l1.2 1.2 1.2-1.2a4.7 4.7 0 0 1 6.6 0 4.6 4.6 0 0 1 0 6.6L12 20.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

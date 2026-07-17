"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { usePreferences } from "@/store/preferences";
import { useLibraryUI } from "@/store/library-ui";
import { useHydrated } from "@/lib/use-hydrated";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Library" },
  { href: "/progress", label: "My progress" },
  { href: "/favorites", label: "Favorites" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const query = useLibraryUI((s) => s.query);
  const setQuery = useLibraryUI((s) => s.setQuery);
  const favorites = usePreferences((s) => s.favorites);
  const hydrated = useHydrated();
  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl-K focuses search (design §3).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (pathname !== "/") router.push("/");
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, router]);

  const onSearch = (value: string) => {
    setQuery(value);
    if (value && pathname !== "/") router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded-md bg-emerald text-[13px] font-bold text-[#001910]"
          >
            S
          </span>
          <span className="font-semibold tracking-tight">SysViz</span>
          <span className="hidden rounded bg-surface-2 px-1 py-0.5 font-mono text-[9px] text-muted-fg sm:inline">
            v1.0
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const showCount = item.href === "/favorites" && hydrated && favorites.length > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  active
                    ? "bg-surface-3 text-text"
                    : "text-muted-fg hover:text-text-2",
                )}
              >
                {item.label}
                {showCount && (
                  <span className="rounded bg-emerald/15 px-1 font-mono text-[10px] text-emerald">
                    {favorites.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="relative ml-auto hidden w-full max-w-xs items-center sm:flex">
          <SearchIcon className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-fg" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search lessons, concepts…"
            aria-label="Search lessons"
            className="h-9 w-full rounded-md border border-border-2 bg-surface pl-8 pr-9 text-[13px] text-text placeholder:text-muted-fg focus:border-border-3"
          />
          <kbd className="pointer-events-none absolute right-2 hidden rounded bg-surface-2 px-1 py-0.5 font-mono text-[10px] text-muted-fg md:inline">
            ⌘K
          </kbd>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

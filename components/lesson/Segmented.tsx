"use client";

import { cn } from "@/lib/utils";

/** Accessible segmented control (design §7). Options are label + value pairs. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center rounded-md border border-border-2 bg-surface p-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-[36px] rounded px-3 font-mono text-[11px] transition-colors",
              active
                ? "bg-surface-3 text-text"
                : "text-muted-fg hover:text-text-2",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

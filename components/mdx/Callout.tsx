import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warn" | "tip";

const STYLES: Record<CalloutType, { border: string; label: string; icon: string }> = {
  info: { border: "border-l-[#5B8CFF]", label: "text-[#5B8CFF]", icon: "ℹ" },
  warn: { border: "border-l-[#FF5A6A]", label: "text-[#FF5A6A]", icon: "⚠" },
  tip: { border: "border-l-emerald", label: "text-emerald", icon: "✦" },
};

const HEADING: Record<CalloutType, string> = {
  info: "Note",
  warn: "Watch out",
  tip: "Tip",
};

export function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType;
  children: ReactNode;
}) {
  const style = STYLES[type];
  return (
    <div
      className={cn(
        "my-5 rounded-r-md border-l-2 bg-surface-2/60 px-4 py-3",
        style.border,
      )}
    >
      <p className={cn("mb-1 font-mono text-[11px] font-semibold uppercase tracking-wide", style.label)}>
        <span aria-hidden className="mr-1">{style.icon}</span>
        {HEADING[type]}
      </p>
      <div className="text-[13px] leading-relaxed text-text-2 [&_strong]:text-text [&>p]:m-0">
        {children}
      </div>
    </div>
  );
}

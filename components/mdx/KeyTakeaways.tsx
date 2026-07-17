import type { ReactNode } from "react";

/** Closing summary box. Every lesson should end with one (CONTENT_MODEL §body). */
export function KeyTakeaways({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-lg border border-emerald/25 bg-emerald/[0.05] p-4">
      <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-emerald">
        <span aria-hidden>★</span> Key takeaways
      </p>
      <div className="text-[13px] leading-relaxed text-text-2 [&_li]:mb-1.5 [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-text [&>ul]:m-0">
        {children}
      </div>
    </div>
  );
}

import { Fragment, type ReactNode } from "react";

/**
 * Minimal, safe Markdown renderer for user notes — supports the subset the
 * notes toolbar produces: **bold**, *italic*, `code`, and - / * bullet lists.
 * Renders to React nodes (no dangerouslySetInnerHTML), so user input can't
 * inject markup.
 */
export function renderMarkdown(md: string): ReactNode {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (list.length === 0) return;
    const items = list;
    list = [];
    blocks.push(
      <ul key={key} className="my-1.5 ml-4 list-disc space-y-0.5">
        {items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
  };

  lines.forEach((line, i) => {
    // 1. Bullet list items
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1] ?? "");
      return;
    }
    flushList(`ul-${i}`);

    // 2. Headers
    const h1 = line.match(/^#\s+(.*)$/);
    if (h1) {
      blocks.push(
        <h1 key={`h1-${i}`} className="mt-3.5 mb-1.5 text-[15px] font-bold text-text tracking-tight">
          {renderInline(h1[1] ?? "")}
        </h1>
      );
      return;
    }

    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) {
      blocks.push(
        <h2 key={`h2-${i}`} className="mt-3 mb-1 text-[13px] font-bold text-text tracking-tight">
          {renderInline(h2[1] ?? "")}
        </h2>
      );
      return;
    }

    const h3 = line.match(/^###\s+(.*)$/);
    if (h3) {
      blocks.push(
        <h3 key={`h3-${i}`} className="mt-2.5 mb-1 text-[12px] font-bold text-text-2 tracking-tight">
          {renderInline(h3[1] ?? "")}
        </h3>
      );
      return;
    }

    // 3. Blockquotes
    const bq = line.match(/^>\s+(.*)$/);
    if (bq) {
      blocks.push(
        <blockquote key={`bq-${i}`} className="my-2 border-l-2 border-emerald/50 pl-3 italic text-muted-fg text-[12px]">
          {renderInline(bq[1] ?? "")}
        </blockquote>
      );
      return;
    }

    // 4. Blank line / Paragraph
    if (line.trim() === "") {
      blocks.push(<div key={`space-${i}`} className="h-2" />);
      return;
    }

    blocks.push(
      <p key={`p-${i}`} className="my-1.5 text-[13px] leading-relaxed text-text-2">
        {renderInline(line)}
      </p>,
    );
  });
  flushList("ul-end");

  return <>{blocks}</>;
}

// Splits a line on **bold**, `code`, and *italic* / _italic_ tokens.
function renderInline(text: string): ReactNode {
  const tokenRe = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(tokenRe).filter((p) => p !== "");
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-text">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-surface-2 px-1 font-mono text-[0.9em]">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (
          (part.startsWith("*") && part.endsWith("*")) ||
          (part.startsWith("_") && part.endsWith("_"))
        ) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

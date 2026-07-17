"use client";
import { useEffect, useRef, useState } from "react";
import { useNotes, type Note } from "@/store/notes";
import { useLessonStore } from "@/store/lesson";
import { renderMarkdown } from "@/lib/mini-markdown";
import { cn } from "@/lib/utils";

const AUTOSAVE_MS = 800;

/**
 * Per-lesson/step Markdown notes (design §6). Desktop: right drawer (420px).
 * Mobile: bottom sheet (~85vh). Autosaves to localStorage; exports to .md.
 * Displays the editor for the active step and a list of notes from other steps below.
 */
export function NotesDrawer({
  slug,
  title,
  open,
  onClose,
}: {
  slug: string;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const activeStep = useLessonStore((s) => s.activeStep);
  const setActiveStep = useLessonStore((s) => s.setActiveStep);

  const notesForLesson = useNotes((s) => s.notes[slug]) ?? {};
  const currentNote = notesForLesson[activeStep];
  const setNote = useNotes((s) => s.setNote);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const exportMd = () => {
    const lines: string[] = [`# Notes: ${title}\n`];
    Object.entries(notesForLesson)
      .map(([idxStr, n]) => ({ idx: Number(idxStr), note: n }))
      .sort((a, b) => a.idx - b.idx)
      .forEach(({ idx, note }) => {
        if (note.md.trim()) {
          lines.push(`## Step ${idx + 1}\n\n${note.md}\n`);
        }
      });

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const otherNotes = Object.entries(notesForLesson)
    .map(([idxStr, n]) => ({ idx: Number(idxStr), note: n }))
    .filter(({ idx, note }) => {
      return (
        !isNaN(idx) &&
        idx !== activeStep &&
        note &&
        typeof note.md === "string" &&
        note.md.trim() !== ""
      );
    })
    .sort((a, b) => a.idx - b.idx);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Notes: ${title}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          "absolute flex flex-col border-border-2 bg-surface shadow-lg",
          "inset-x-0 bottom-0 h-[85vh] rounded-t-xl border-t",
          "sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[420px] sm:rounded-none sm:border-l sm:border-t-0",
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-[13px] font-semibold text-text">Notes</p>
            <p className="font-mono text-[10px] text-muted-fg">{title}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={exportMd}
              className="rounded-md border border-border-2 px-2.5 py-1 font-mono text-[10px] text-text-2 hover:border-border-3 transition-colors"
            >
              Export .md
            </button>
            <button
              onClick={onClose}
              aria-label="Close notes"
              className="grid h-8 w-8 place-items-center rounded-md border border-border-2 text-text-2 hover:border-border-3 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
          {/* Active Editor Card (remounts when activeStep changes to reset state) */}
          <NoteEditorCard
            key={`${slug}-${activeStep}`}
            slug={slug}
            activeStep={activeStep}
            currentNote={currentNote}
            setNote={setNote}
            open={open}
          />

          {/* Existing Notes List */}
          {otherNotes.length > 0 && (
            <div className="flex flex-col gap-2.5 mt-2">
              <p className="font-mono text-[9px] font-bold tracking-wider text-muted-fg uppercase">
                existing notes
              </p>
              <div className="flex flex-col gap-3">
                {otherNotes.map(({ idx, note }) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-surface-3 p-3.5 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                      <span className="font-mono text-[10px] text-muted-fg">
                        step 0{idx + 1} · {savedAgo(note.updatedAt)}
                      </span>
                      <button
                        onClick={() => setActiveStep(idx)}
                        className="font-mono text-[9px] text-emerald hover:text-accent-2 transition-colors"
                      >
                        view step
                      </button>
                    </div>
                    <div className="text-[12px] leading-relaxed text-text-2">
                      {renderMarkdown(note.md)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Local Storage Indicator */}
        <div className="border-t border-border px-4 py-2.5 font-mono text-[10px] text-muted-fg bg-surface-2/30">
          Stored locally in your browser
        </div>
      </div>
    </div>
  );
}

interface NoteEditorCardProps {
  slug: string;
  activeStep: number;
  currentNote: Note | undefined;
  setNote: (slug: string, pageIdx: number, md: string) => void;
  open: boolean;
}

function NoteEditorCard({
  slug,
  activeStep,
  currentNote,
  setNote,
  open,
}: NoteEditorCardProps) {
  const [value, setValue] = useState(() => currentNote?.md ?? "");
  const [savedAt, setSavedAt] = useState<number | null>(() => currentNote?.updatedAt ?? null);
  const [preview, setPreview] = useState(false);
  const [, setTick] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced autosave.
  useEffect(() => {
    if (!open) return;
    if (value === (currentNote?.md ?? "")) return;
    const t = setTimeout(() => {
      setNote(slug, activeStep, value);
      setSavedAt(Date.now());
    }, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [value, open, slug, activeStep, currentNote?.md, setNote]);

  // Re-render the "saved Xs ago" label each second.
  useEffect(() => {
    if (!open) return;
    const i = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, [open]);

  const wrap = (before: string, after = before) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const sel = value.slice(s, e) || "text";
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    setValue(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };

  const prefixLine = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    setValue(next);
    requestAnimationFrame(() => ta.focus());
  };

  const handleSave = () => {
    setNote(slug, activeStep, value);
    setSavedAt(Date.now());
  };

  const handleDiscard = () => {
    setValue(currentNote?.md ?? "");
  };

  const hasChanges = value !== (currentNote?.md ?? "");

  return (
    <div className="rounded-lg border border-emerald/30 bg-surface-2 p-3.5 flex flex-col gap-3">
      {/* Card Header: Editing title + formatting controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald">
          editing · step {activeStep + 1}
        </div>

        <div className="flex items-center gap-1">
          <ToolbarBtn label="Bold" onClick={() => wrap("**")}>
            <span className="font-bold">B</span>
          </ToolbarBtn>
          <ToolbarBtn label="Italic" onClick={() => wrap("*")}>
            <span className="italic">I</span>
          </ToolbarBtn>
          <ToolbarBtn label="Code" onClick={() => wrap("`")}>
            <span className="font-mono">{"</>"}</span>
          </ToolbarBtn>
          <ToolbarBtn label="List" onClick={() => prefixLine("- ")}>
            <span className="font-mono">•—</span>
          </ToolbarBtn>

          <span className="mx-1 h-3.5 w-[1px] bg-border" />

          {/* Write/Preview Tabs */}
          <button
            onClick={() => setPreview(false)}
            className={cn(
              "rounded px-2 py-0.5 font-mono text-[9px] border transition-colors",
              !preview
                ? "border-emerald/30 bg-emerald/10 text-emerald"
                : "border-transparent text-muted-fg hover:text-text-2"
            )}
          >
            Write
          </button>
          <button
            onClick={() => setPreview(true)}
            className={cn(
              "rounded px-2 py-0.5 font-mono text-[9px] border transition-colors",
              preview
                ? "border-emerald/30 bg-emerald/10 text-emerald"
                : "border-transparent text-muted-fg hover:text-text-2"
            )}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Text Area or Preview Pane */}
      {preview ? (
        <div className="min-h-[140px] max-h-[240px] overflow-y-auto text-[13px] leading-relaxed text-text-2 bg-black/20 rounded p-2">
          {value.trim() ? (
            renderMarkdown(value)
          ) : (
            <p className="text-muted-fg italic text-[11px]">Nothing to preview.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Write notes in Markdown… **bold**, *italic*, `code`, - lists"
          className="min-h-[140px] max-h-[240px] resize-none bg-transparent text-[13px] leading-relaxed text-text placeholder:text-muted-fg focus:!outline-none focus:!shadow-none focus-visible:!outline-none focus-visible:!shadow-none"
          style={{ boxShadow: "none" }}
        />
      )}

      {/* Card Footer: Save/Discard buttons + saved state */}
      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <span className="font-mono text-[10px] text-muted-fg">
          {savedAt ? `saved ${savedAgo(savedAt)}` : "not saved yet"}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDiscard}
            disabled={!hasChanges}
            className="px-2.5 py-1 text-[11px] font-mono text-muted-fg border border-border-2 rounded hover:border-border-3 hover:text-text-2 disabled:opacity-40 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-2.5 py-1 text-[11px] font-mono bg-emerald text-black font-semibold rounded hover:bg-emerald-2 disabled:opacity-40 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded border border-border-2 text-[12px] text-text-2 hover:border-border-3 hover:text-text transition-colors"
    >
      {children}
    </button>
  );
}

function savedAgo(ts: number): string {
  const secs = Math.round((Date.now() - ts) / 1000);
  if (secs < 3) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

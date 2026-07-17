# CLAUDE.md — Agent Guide for SysViz

This file is the single source of truth for any AI assistant (Claude, or otherwise)
working in this repo. Its job is to make code from **different contributors and different
models come out consistent and on-spec**. Read it fully before making changes.

> If you also support `AGENTS.md`, treat that as a symlink of this file. Keep them identical.

---

## 1. What this project is

An interactive system-design learning platform. See `docs/VISION.md` for scope and
non-goals. **Respect the non-goals** — do not add features outside v1 scope even if
they seem helpful.

## 2. Golden rules (do not violate)

1. **TypeScript strict mode, always.** No `any`. No `@ts-ignore` without a `// reason:` comment. Prefer explicit types on exported functions.
2. **The simulation engine (`src/lib/sim`) imports nothing from React or Three.** It is pure TS: data structures, an event queue, and state transitions. The rendering layer subscribes to it, never the reverse.
3. **Content is data, not code.** Lessons are MDX files under `content/`, validated against the schema in `docs/CONTENT_MODEL.md`. Never hardcode lesson text inside components.
4. **3D only where it adds value.** Spatial concepts (scaling, replication, CDN, sharding) → 3D scenes in `src/scenes`. Conceptual/tabular ideas (CAP, SQL vs NoSQL, ACID) → animated 2D in `src/components`. The `dimension` frontmatter field decides which; honour it.
5. **Accuracy over volume.** This is a learning tool. Wrong content is worse than missing content. Anything you author or edit under `content/` must be flagged for human review (see `docs/CONTRIBUTING.md` → Content-review gate). Do not assert system-design "facts" you are unsure of; mark them `TODO(review):`.

## 3. Stack & conventions

- Next.js App Router, React 19, Bun, Tailwind, shadcn/ui, Zustand, Framer Motion, React Three Fiber + drei.
- Full details and folder conventions: `docs/ARCHITECTURE.md`.
- Use `bun` for all commands (`bun install`, `bun run dev`, `bun test`). Never introduce npm/pnpm/yarn lockfiles.
- Styling: Tailwind utility classes + shadcn components. No inline style objects except for dynamic values (e.g. a computed transform).
- State: local `useState` for component state; Zustand store only for cross-component/scene state (e.g. current lesson, playback state).

## 4. File-placement decision tree

- New route/page → `src/app/.../page.tsx`
- Reusable 2D UI → `src/components/`
- A 3D scene for a lesson → `src/scenes/<lesson-id>/`
- Pure logic (no React) → `src/lib/`
- Simulation logic → `src/lib/sim/` (framework-free, unit-tested)
- New lesson content → `content/concepts/` or `content/system-designs/`

## 5. Definition of Done (every change)

- [ ] `bun run typecheck` passes with zero errors.
- [ ] `bun run lint` passes.
- [ ] Pure logic has a Vitest test (`*.test.ts` next to the file).
- [ ] No console errors/warnings in the browser for the touched screen.
- [ ] 3D scenes clean up on unmount (dispose geometries/materials; no leaked animation frames).
- [ ] Works on mobile viewport (375px wide) — see responsive rules in `docs/CONTRIBUTING.md`.
- [ ] New content passes the schema and is marked for human review.

## 6. When you're unsure

- If a spec is ambiguous, **stop and state the ambiguity** in your output rather than guessing.
- If a task would pull you outside v1 scope, say so and propose deferring it.
- Prefer the smallest change that satisfies the spec. This is a learning project; readability beats cleverness.

## 7. Key references

- `docs/VISION.md` · `docs/ARCHITECTURE.md` · `docs/CONTENT_MODEL.md` · `docs/CONTRIBUTING.md` · `docs/DESIGN_HANDOFF.md`
- Feature specs live in `specs/`. The current milestone is `specs/000-vertical-slice.md`.

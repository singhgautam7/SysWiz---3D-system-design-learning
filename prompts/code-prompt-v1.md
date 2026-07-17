# Code Prompt — v1 Vertical Slice

Paste this into your coding agent (Claude Code, or similar) from the repo root, **after**
the design handoff exists. It builds the v1 vertical slice defined in
`specs/000-vertical-slice.md`.

---

You are building **SysViz**. Before writing any code, read these files and follow them
exactly: `CLAUDE.md`, `docs/VISION.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_MODEL.md`,
`docs/CONTRIBUTING.md`, and the spec `specs/000-vertical-slice.md`. Also read the two seed
lessons in `content/concepts/` and the design handoff in `specs/design/` if present.

**Respect the v1 non-goals** in `docs/VISION.md`. Do not build a simulation engine, auth,
AI features, search, or more than the two seed lessons.

## Task
Implement the v1 vertical slice: a working Next.js app with a home/library page and two
lesson pages (one 3D, one 2D), driven by the real content pipeline, responsive on web and
mobile, per the acceptance criteria in `specs/000-vertical-slice.md`.

## Setup
- Next.js (App Router) + React 19 + TypeScript **strict** (`strict`, `noUncheckedIndexedAccess`).
- **Bun** as package manager and runtime. `package.json` scripts:
  `"dev": "bun --bun next dev"`, `"build": "bun --bun next build"`,
  `"start": "bun --bun next start"`, plus `typecheck`, `lint`, `test`, `content:check`.
- Tailwind CSS + shadcn/ui, Zustand, Framer Motion, React Three Fiber + `@react-three/drei`,
  Vitest. MDX via fumadocs *or* `next-mdx-remote` — pick one, justify briefly, and keep the
  frontmatter schema as the real contract.
- Follow the exact folder layout in `docs/ARCHITECTURE.md`. Create `src/lib/sim/README.md`
  stating the no-React/no-Three rule, but **leave the engine empty** (phase 2).

## Build, in order

1. **Content pipeline** (`src/lib/content/`): a **zod** schema matching
   `docs/CONTENT_MODEL.md` exactly; a loader that reads MDX from `content/`, validates
   frontmatter, and lists lessons; a `content:check` script that fails on schema violations,
   `id`≠filename, missing `sceneRef`/`componentRef` for the declared `dimension`, or
   `reviewStatus: reviewed` without a recorded reviewer. Add Vitest tests for it.

2. **App shell & Home/Library** (`src/app/page.tsx`): list the two seed lessons from content,
   grouped by category, each card showing title, summary, difficulty pill, and a 2D/3D badge.
   No Three.js on this route. Mobile single-column, desktop grid.

3. **Lesson route** (`src/app/concepts/[slug]/page.tsx`): render the MDX body with the
   approved custom components (`Callout`, `Step`, `Compare`, `KeyTakeaways`) registered in an
   MDX provider, and render the referenced visual based on `dimension`:
   - `3d` → dynamically import the scene from `src/scenes/<sceneRef>/` with `ssr: false`.
   - `2d` → render the component named by `componentRef` from `src/components`.
   - Desktop: visual/text side-by-side (~60/40). Mobile: visual stacked above text; sticky
     control bar.

4. **3D scene** `src/scenes/horizontal-vs-vertical-scaling/Scene.tsx`: a server "box"; a
   control to toggle **scale up** (the box grows) vs **scale out** (it becomes several
   identical boxes behind a simple load-balancer node). OrbitControls with sensible zoom
   limits; works with mouse and touch; `dpr={[1,2]}`; disposes resources on unmount; static
   first frame under `prefers-reduced-motion`.

5. **2D widget** `src/components/MessageQueueViz.tsx`: producers emit messages that flow into
   a queue and are consumed; **play/pause/step** controls and a **producer-rate** slider; the
   queue visibly grows when producers outrun the consumer and drains otherwise. Keep the small
   enqueue/dequeue/rate logic as a pure function with a Vitest test (co-located, **not** in
   `src/lib/sim`). Framer Motion for movement; respect reduced-motion.

6. **State**: a small Zustand store only if needed for playback/scene toggle state; otherwise
   local state.

## Quality gates (must pass before you call it done)
- `bun run typecheck`, `bun run lint`, `bun run content:check`, and `bun test` all clean.
- Meets **every** acceptance criterion in `specs/000-vertical-slice.md`.
- Verified at 375px and desktop widths; visual stacks above text on mobile.
- Reduced-motion path verified.
- No console errors/warnings; scenes clean up on unmount.

## Output
Working code committed in small, reviewable pieces. For anything ambiguous in the specs,
**state the ambiguity and your assumption** in your summary rather than silently guessing.
Leave lesson `reviewStatus` as `needs-review` — content still needs a human accuracy pass.

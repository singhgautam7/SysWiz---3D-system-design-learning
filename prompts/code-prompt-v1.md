# Code Prompt — v1 Vertical Slice

Paste this into your coding agent (Claude Code, or similar) from the repo root, **after**
the design handoff exists. It builds the v1 vertical slice defined in
`specs/000-vertical-slice.md`.

---

You are building **SysViz**. Before writing any code, read and follow exactly: `CLAUDE.md`,
`docs/VISION.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_MODEL.md`, `docs/SCENE_FORMAT.md`,
`docs/CONTRIBUTING.md`, and the spec `specs/000-vertical-slice.md`. Also read the two seed
lessons in `content/concepts/`, the seed scene in `content/scenes/`, and the design handoff
in `specs/design/` if present.

**Respect the v1 non-goals** in `docs/VISION.md`. Do not build a simulation engine, auth, AI
features, search, or more than the two seed lessons.

## Important: how 3D relates to the design

**3D scenes are built in code, not derived from the design.** The design handoff only
specifies the UI *around* the 3D viewport — the viewport frame, control bar, explanation
panel, and responsive layout. The 3D area in the mockups is a placeholder rectangle. Do not
attempt to reconstruct scene geometry from the design. Instead, render 3D from declarative
**scene files** via a generic renderer, per `docs/SCENE_FORMAT.md`.

## Task
Implement the v1 vertical slice: a working Next.js app with a home/library page and two
lesson pages (one 3D, one 2D), driven by the real content pipeline **and a generic
declarative 3D renderer**, responsive on web and mobile, per the acceptance criteria in
`specs/000-vertical-slice.md`.

## Setup (skip anything already scaffolded)
- Next.js (App Router) + React 19 + TypeScript **strict** (`strict`, `noUncheckedIndexedAccess`).
- **Bun** as package manager and runtime. `package.json` scripts:
  `"dev": "bun --bun next dev"`, `"build": "bun --bun next build"`,
  `"start": "bun --bun next start"`, plus `typecheck`, `lint`, `test`, `content:check`.
- Tailwind + shadcn/ui, Zustand, Framer Motion, React Three Fiber + `@react-three/drei`,
  zod, Vitest. MDX via `next-mdx-remote` + `gray-matter` (or fumadocs — pick one, justify
  briefly). The frontmatter schema is the real contract regardless.
- Follow the exact folder layout in `docs/ARCHITECTURE.md`. Create `src/lib/sim/README.md`
  stating the no-React/no-Three rule, but **leave the engine empty** (phase 2).

## Build, in order

1. **Content pipeline** (`src/lib/content/`): a **zod** schema matching `docs/CONTENT_MODEL.md`
   exactly (including `sceneRef` vs `sceneComponent` for 3D); a loader that reads MDX from
   `content/`, validates frontmatter, and lists lessons; a `content:check` script that fails
   on schema violations, `id`≠filename, a `3d` lesson with neither a matching
   `content/scenes/<sceneRef>.scene.json` nor a `sceneComponent`, a `2d` lesson without a
   `componentRef`, or `reviewStatus: reviewed` without a recorded reviewer. Vitest tests included.

2. **Declarative 3D engine** (`src/scenes/_engine/`) — the core of this milestone. Per
   `docs/SCENE_FORMAT.md`:
   - `schema.ts`: zod schema for the scene format v0.1 (nodes, edges, steps, camera, layout).
   - `loader.ts`: read `content/scenes/*.scene.json` (accept `.scene.yaml` too), validate, and
     give a clear error on failure.
   - `layout.ts`: implement `layered` layout (place by `rank` along `direction`, stack
     same-rank nodes, fan `count>1` instances); support `manual` positions.
   - `nodeKit/`: one small mesh per node `type` in the v0.1 enum
     (`client, load-balancer, server, service, database, cache, queue, cdn, storage, region`),
     registered in a lookup. Adding a type = add a mesh + extend the enum, nothing else.
   - `SceneRenderer.tsx`: validate → layout → render nodes (instanced when `count>1`) →
     render edges (tubes/lines; animated flow particles when `animated`, gated by
     `prefers-reduced-motion`) → apply `steps` highlight + camera by `activeStep` →
     OrbitControls (mouse + touch, sane zoom limits) → tap a node to reveal its
     `description` → dispose resources on unmount, `dpr={[1,2]}`.
   The renderer must be **lesson-agnostic**: all lesson specifics come from the scene file.

3. **App shell & Home/Library** (`src/app/page.tsx`): list the two seed lessons from content,
   grouped by category, each card showing title, summary, difficulty pill, and a 2D/3D badge.
   No Three.js on this route. Mobile single-column, desktop grid.

4. **Lesson route** (`src/app/concepts/[slug]/page.tsx`): render the MDX body with the approved
   custom components (`Callout`, `Step`, `Compare`, `KeyTakeaways`) registered in an MDX
   provider, and render the visual by `dimension`:
   - `3d` with `sceneRef` → dynamically import `SceneRenderer` (`ssr: false`) and feed it the
     parsed scene file; wire the MDX `<Step>` index to the scene's `activeStep`.
   - `3d` with `sceneComponent` → dynamically import that custom scene (escape hatch).
   - `2d` → render the component named by `componentRef` from `src/components`.
   - Desktop: visual/text side-by-side (~60/40). Mobile: visual stacked above text; sticky
     control bar.

5. **Seed 3D lesson**: render `content/scenes/horizontal-vs-vertical-scaling.scene.json`
   through `SceneRenderer` (client → load balancer → 3 app servers → database, stepped). Add a
   small **"scale up vs scale out"** UI toggle in the lesson's control bar: "scale out" shows
   the fleet as authored; "scale up" collapses to a single, larger server node. Keep this
   toggle in the lesson chrome — do **not** pollute the generic renderer with lesson logic.

6. **Seed 2D lesson** `src/components/MessageQueueViz.tsx`: producers emit messages into a
   queue consumed by a consumer; **play/pause/step** controls and a **producer-rate** slider;
   the queue visibly grows when producers outrun the consumer and drains otherwise. Keep the
   enqueue/dequeue/rate logic as a pure function with a co-located Vitest test (**not** in
   `src/lib/sim`). Framer Motion for movement; respect reduced-motion.

7. **State**: a small Zustand store only if needed for playback/step/toggle state; otherwise
   local state.

## Quality gates (must pass)
- `bun run typecheck`, `bun run lint`, `bun run content:check`, `bun test` all clean.
- Meets **every** acceptance criterion in `specs/000-vertical-slice.md`.
- The 3D lesson renders entirely from the scene file through the generic `SceneRenderer`
  (prove the format works — a second scene file should render with zero renderer changes).
- Verified at 375px and desktop; visual stacks above text on mobile; reduced-motion path works.
- No console errors/warnings; scenes clean up on unmount.

## Output
Working code in small, reviewable commits. For anything ambiguous, **state the ambiguity and
your assumption** in your summary rather than silently guessing. Leave lesson `reviewStatus`
as `needs-review` — content still needs a human accuracy pass.

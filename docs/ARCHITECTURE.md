# ARCHITECTURE.md

## Overview

A single Next.js (App Router) application. **No monorepo, no Turborepo** for now — with a
1–2 person team it adds overhead without payoff. The one piece we keep isolated is the
future simulation engine, which lives in its own folder with a hard import boundary so it
*can* be extracted into a package later without rewrites.

## Stack

- **Next.js (App Router) + React 19** — routing, RSC, static generation of content pages.
- **TypeScript, strict** — `"strict": true`, `"noUncheckedIndexedAccess": true`. No `any`.
- **Bun** — package manager and local runtime. `bun install`, `bun run dev`, `bun test`.
- **React Three Fiber + @react-three/drei** — all 3D scenes. drei gives us `OrbitControls`,
  `Html` (anchor 2D labels to 3D positions), `Environment`, etc.
- **Framer Motion** — 2D animation and UI transitions. **GSAP** only if a specific scene
  needs timeline choreography Framer can't express cleanly; justify it in the PR.
- **Zustand** — cross-component/scene state only (current lesson, playback, complexity level).
- **Tailwind CSS + shadcn/ui** — styling and base components.
- **MDX** — content. Evaluate **fumadocs** (purpose-built content framework) vs
  `next-mdx-remote`. Default recommendation: fumadocs, but confirm it fits our custom
  lesson layout before committing. Whichever we pick, the *frontmatter schema*
  (`docs/CONTENT_MODEL.md`) is the contract, not the loader.
- **Vitest** — unit tests for pure logic. **Playwright** later for flows.
- **Vercel** — hosting.

## Folder conventions

```
src/
  app/
    page.tsx                 # home / library
    concepts/[slug]/page.tsx # concept lesson pages (generated from content/concepts)
    system-designs/[slug]/page.tsx
    layout.tsx
  components/                # shared 2D UI (nav, cards, lesson chrome, 2D animated widgets)
    ui/                      # shadcn components
  scenes/                    # 3D scenes, one folder per lesson
    horizontal-vs-vertical-scaling/
      Scene.tsx              # the R3F <Canvas> content
      index.ts               # exports the scene + its metadata
  lib/
    content/
      schema.ts              # zod schema for lesson frontmatter
      load.ts                # read + validate MDX, list lessons
    sim/                     # PHASE 2+ — framework-agnostic simulation engine
      README.md              # "do not import React/Three here"
    utils.ts
  store/                     # Zustand stores
  styles/
content/
  concepts/*.mdx
  system-designs/*.mdx
```

## The simulation boundary (important)

`src/lib/sim` is reserved for the phase-2 simulation engine. The rule, enforced by review
and (later) an ESLint `no-restricted-imports` rule:

- `src/lib/sim/**` may import: standard TS, small pure utilities.
- `src/lib/sim/**` may **NOT** import: `react`, `three`, `@react-three/*`, `next/*`, any DOM.
- The engine exposes plain data + subscribe/step APIs. Scenes read engine state and render
  it; they never push rendering concerns into the engine.

Why: the simulation logic is the hardest part of the whole project (est. 8/10). Keeping it
pure means we can unit-test it exhaustively without a browser, and swap the visualization
without touching the model.

## Rendering guidelines (3D)

- One `<Canvas>` per lesson page, mounted only on that page (dynamic import with
  `ssr: false` so Three isn't in the server bundle).
- Dispose geometries/materials and cancel animation frames on unmount.
- Prefer instanced meshes when drawing many identical nodes (e.g. a fleet of servers).
- Keep scenes at 60fps on a mid-range laptop; provide a reduced-motion fallback
  (`prefers-reduced-motion`) that shows a static or low-frame version.
- Anchor textual labels with drei `<Html>` so they stay legible and accessible.

## Rendering guidelines (2D)

- Framer Motion for enter/exit and interactive transitions.
- Respect `prefers-reduced-motion`: gate non-essential motion.
- 2D "animated diagrams" are still driven by data where possible (e.g. an array of steps),
  so they're easy to author and consistent across lessons.

## Data flow

Content (MDX) → validated by `lib/content` at build time → rendered by the lesson page,
which composes the MDX body with the referenced visual (`dimension: 3d` → a scene from
`src/scenes`, `dimension: 2d` → a component from `src/components`). Interactive state
(playback, complexity level) lives in Zustand.

## Performance budget (v1)

- Initial route JS (home/library): keep lean; no Three.js on the home route.
- Lesson pages load their scene lazily.
- Lighthouse performance ≥ 90 on the home route on mobile emulation.

## Accessibility baseline

- Keyboard-navigable lessons and controls.
- Every interactive control has an accessible label.
- 3D scenes have a text alternative (the MDX body already provides the explanation).
- Colour is never the *only* signal (pair colour with shape/label — matters for the
  planned request-flow colour coding).

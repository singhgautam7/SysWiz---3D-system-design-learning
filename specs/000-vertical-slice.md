# Spec 000 — v1 Vertical Slice: Interactive Visual Library

**Status:** Ready · **Milestone:** v1 · **Owner:** _you_

## Goal

Ship the thinnest end-to-end product that proves the format teaches: a small library with
one 3D lesson and one 2D lesson, wired through the real content pipeline, responsive on web
and mobile. No simulation engine, no accounts, no AI (see `docs/VISION.md` non-goals).

## User stories

1. As a visitor, I land on a **home/library** page and see available lessons grouped by
   category, each with title, summary, difficulty, and a `2D`/`3D` badge.
2. As a visitor, I open the **Horizontal vs Vertical Scaling** lesson and interact with a
   **3D scene**: I can orbit/zoom, toggle between "scale up" (one box grows) and "scale out"
   (more boxes appear), and read a synced explanation.
3. As a visitor, I open the **Message Queue** lesson and interact with a **2D animation**:
   producers enqueue messages, a consumer dequeues them, and I can pause/step and change the
   producer rate to see the queue grow or drain.
4. As a mobile user, both lessons are fully usable with touch, visual stacked above text.

## In scope

- Next.js App Router project, Bun, TS strict, Tailwind, shadcn/ui, Zustand, Framer Motion,
  React Three Fiber + drei — per `docs/ARCHITECTURE.md`.
- Content pipeline: `src/lib/content` (zod schema from `docs/CONTENT_MODEL.md`, MDX loader,
  `content:check` script) reading the two seed lessons in `content/`.
- Home/library route listing lessons from content.
- Lesson route rendering MDX body + the referenced visual (`dimension` decides which).
- One 3D scene: `src/scenes/horizontal-vs-vertical-scaling/`.
- One 2D widget: a `MessageQueueViz` component in `src/components/`.
- Responsive layout per `docs/CONTRIBUTING.md` (mobile-first).
- Reduced-motion fallbacks.
- Vitest tests for content loading/validation and any pure queue logic.

## Out of scope

- Simulation engine, sliders beyond the single message-queue rate control, failure mode,
  time travel, complexity slider, builder, AI, auth, search, more than two lessons.

## Acceptance criteria

- [ ] `bun install && bun run dev` boots to a working home page listing exactly the two seed lessons.
- [ ] Home shows category grouping, difficulty, and a 2D/3D badge per lesson.
- [ ] `/concepts/horizontal-vs-vertical-scaling` renders the MDX explanation + interactive 3D scene with a scale-up/scale-out toggle; orbit + zoom work with mouse and touch.
- [ ] `/concepts/message-queue` renders the MDX explanation + 2D queue animation with pause/step and a producer-rate control; queue visibly grows/drains.
- [ ] Both lessons pass the content schema; `bun run content:check` is green.
- [ ] Verified at 375px and desktop; visual stacks above text on mobile.
- [ ] `prefers-reduced-motion` disables autoplay and shows a static first state.
- [ ] `bun run typecheck` and `bun run lint` clean; content marked `needs-review` until a human accuracy pass.

## Notes / decisions

- The scaling lesson is deliberately animation-not-simulation — no event queue needed;
  keep it in the scene, not in `src/lib/sim`.
- The message-queue lesson's small queue logic (enqueue/dequeue/rate) is the first *pure*
  logic worth unit-testing, but it still lives with the component for v1, **not** in
  `src/lib/sim`. `src/lib/sim` stays empty (with its README) until phase 2.

# CONTRIBUTING.md

Guidelines that keep code consistent across contributors and across AI models. If you use
an AI assistant, point it at `CLAUDE.md` first — this file is the human-and-machine
detail layer.

## Workflow

1. Pick or write a spec in `specs/`. Small, one feature per file.
2. Branch: `feat/<short-name>`, `fix/<short-name>`, or `content/<lesson-id>`.
3. Build the smallest change that satisfies the spec.
4. Meet the **Definition of Done** (below) and open a PR using the checklist.
5. Get one review. Content PRs additionally need the **content-review gate** (below).

## Coding standards

- **TypeScript strict**, no `any`, no unexplained `@ts-ignore`. Export types for public functions.
- Components: function components + hooks. One component per file for anything non-trivial.
- Naming: `PascalCase` components, `camelCase` functions/vars, `kebab-case` files for
  routes and content, `PascalCase` files for components.
- Keep components small. Extract logic to `src/lib` so it can be tested without React.
- No dead code, no commented-out blocks left behind.
- Comments explain **why**, not what. If code needs a "what" comment, simplify it instead.
- Errors: fail loudly in dev, degrade gracefully in prod. No silent catches.

## State

- Local UI state → `useState`/`useReducer`.
- Shared/cross-scene state → a Zustand store in `src/store/`. Keep stores small and typed.
- Never reach into another component's internals; pass props or use a store.

## 3D / performance rules

- Lazy-load scenes (`dynamic(() => import(...), { ssr: false })`). No Three.js on the home route.
- Dispose geometries/materials and cancel `requestAnimationFrame`/loops on unmount.
- Instance repeated meshes; don't create N materials for N identical nodes.
- Target 60fps mid-range laptop. Provide a `prefers-reduced-motion` fallback.
- Keep textures small; prefer generated geometry over heavy assets where possible.

## 2D / animation rules

- Framer Motion by default; GSAP only with justification in the PR.
- Gate non-essential motion behind `prefers-reduced-motion`.
- Drive animated diagrams from data (arrays of steps), not hand-placed absolute coordinates,
  so they're maintainable.

## Accessibility

- Keyboard navigation for all interactive controls.
- Accessible labels on controls; alt text / text alternatives for visuals.
- Colour never the only signal — pair with shape or label.

## Definition of Done

- [ ] `bun run typecheck` clean.
- [ ] `bun run lint` clean.
- [ ] Pure logic covered by Vitest tests.
- [ ] No browser console errors/warnings on touched screens.
- [ ] Scenes clean up on unmount.
- [ ] Verified at 375px (mobile) **and** desktop widths.
- [ ] Docs/specs updated if behaviour changed.
- [ ] Content (if any) validates and has correct `reviewStatus`.

## Responsive rules (web + mobile)

Design and build **mobile-first**. Breakpoints (Tailwind defaults): base = mobile,
`md` = tablet, `lg`+ = desktop.

- **Home/library:** single-column card list on mobile; grid on `lg`.
- **Lesson page:** on mobile, visual **stacked above** the explanation, both full-width,
  with a sticky mini-control bar; on desktop, visual and text **side-by-side** (e.g. 60/40).
- **3D on mobile:** touch controls (one-finger orbit, two-finger zoom); cap pixel ratio
  (`dpr={[1, 2]}`) to protect battery/framerate; bigger hit targets for tappable nodes.
- Controls (sliders, play/pause) must be thumb-reachable and ≥ 44px touch targets.

## Content-review gate (do not skip)

This is a **learning platform**; confidently-wrong content is the biggest risk to the whole
project, and LLMs are frequently wrong about system-design specifics.

- Any new/edited lesson starts as `reviewStatus: draft` or `needs-review`.
- Before a lesson can be set to `reviewed` and merged to `main`, **a human with relevant
  knowledge must read it for technical accuracy** and record their handle in the PR.
- AI-generated content is allowed as a *draft*, never as the final authority.
- Mark any claim you're unsure of with `TODO(review):` so reviewers can target it.
- CI blocks `reviewStatus: reviewed` unless a reviewer is recorded.

## PR checklist (paste into the PR description)

```
- [ ] Linked spec: specs/___
- [ ] Definition of Done met
- [ ] Tested on mobile (375px) and desktop
- [ ] (Content) reviewStatus correct; human accuracy reviewer: @___
- [ ] No new package manager lockfiles other than bun.lock
- [ ] Screenshots / screen recording attached for UI changes
```

## Backlog / parked ideas (NOT v1 — see VISION non-goals)

Recorded so we don't lose them:

- Simulation engine (`src/lib/sim`): particle request flow, sliders (users/sec, cache hit
  ratio, latencies), live bottleneck detection.
- Failure Mode (kill node/region → watch reroute); Time Travel (system evolution slider).
- Complexity Slider (beginner/intermediate/advanced views of one system).
- System Builder (drag-and-drop architecture canvas).
- AI Reviewer / Interview Mode — **user-supplied API key only**, never server-side keys.
- **Fundamentals section:** language internals — garbage collectors (incl. Python GC),
  Go goroutines/scheduler, event loops, memory models. Parked for a post-v1 section.
- Request-flow colour coding (blue=request, green=success, red=failure, orange=retry,
  purple=replication, yellow=cache hit) — always pair colour with a second signal.

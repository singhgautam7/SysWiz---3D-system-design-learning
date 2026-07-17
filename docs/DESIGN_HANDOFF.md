# DESIGN_HANDOFF.md

Every design produced (e.g. in Claude Design, on web or mobile) ships with a **handoff
document** using this template. The handoff is the contract between design and code: if a
detail isn't in the handoff, the developer/LLM shouldn't have to guess. Fill every section.

Save one handoff per screen/flow as `specs/design/<screen-name>.handoff.md` and link the
exported design frames.

---

## 1. Screen / flow name

`e.g. Lesson Page — Concept (3D)`

## 2. Purpose & context

- What is this screen for, in one sentence?
- Which spec does it satisfy? (`specs/___`)
- Entry points (how the user arrives) and exits (where they go next).

## 3. Breakpoints covered

Provide frames for **all** of:

- **Mobile** (base, ~375px): _link/frame_
- **Tablet** (`md`, ~768px): _link/frame (or "same as desktop scaled")_
- **Desktop** (`lg`+, ~1280px): _link/frame_

State the responsive behaviour explicitly (what stacks, what reflows, what hides).

## 4. Layout & structure

- Grid/columns and spacing at each breakpoint.
- For the lesson page specifically: where the **visual** sits vs the **explanation**
  (mobile = stacked, desktop = side-by-side 60/40 unless stated).
- Sticky/fixed elements (nav, control bar).

## 5. Design tokens used

Reference the shared token set (do not invent one-off values):

- Colours (semantic names → hex), including the request-flow palette if relevant.
- Typography scale (font family, sizes, weights, line-heights per role).
- Spacing scale, radii, shadows.
- If a token doesn't exist yet, propose it here rather than hardcoding.

## 6. Components

For each component on the screen:

- Name (map to an existing shadcn/ui component where possible).
- States: default / hover / focus / active / disabled / loading / empty / error.
- Content rules (max lines, truncation, overflow).

## 7. Interaction & motion

- What's interactive and what each interaction does.
- Motion: enter/exit, transitions, durations, easing. Note the `prefers-reduced-motion`
  fallback for every non-essential animation.
- For 3D: camera default position, allowed orbit/zoom limits, what's tappable, what the
  tap reveals, touch gestures on mobile.

## 8. Content & data

- Which fields come from lesson frontmatter (`docs/CONTENT_MODEL.md`) vs static UI copy.
- Real example content, not lorem ipsum, so the design is validated against real length.

## 9. Accessibility notes

- Focus order, keyboard interactions.
- Labels/alt text for visuals and controls.
- Contrast checked (AA minimum).

## 10. Assets

- Exported icons/images and their formats/sizes.
- Any Lottie/spritesheet or 3D asset references.

## 11. Acceptance criteria

Bulleted, testable statements a reviewer can check off, e.g.:

- [ ] On mobile, the 3D scene appears above the explanation and is full-width.
- [ ] Tapping a server node shows its label and a one-line description.
- [ ] Reduced-motion users see a static first frame with no auto-play.

## 12. Open questions

Anything undecided, so it's resolved before coding rather than guessed.

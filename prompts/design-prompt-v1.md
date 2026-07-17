# Design Prompt — v1 (Web + Mobile)

Paste this into your design tool (e.g. Claude Design). It produces the v1 screens for both
web and mobile. Fill the two blanks if you have preferences; otherwise the defaults stand.

---

You are designing **SysViz**, an interactive platform for learning system design by
*watching systems move* rather than reading static diagrams. Design the **v1** interface for
both **desktop (web)** and **mobile**. Deliver a matching handoff per the template in
`docs/DESIGN_HANDOFF.md`.

## Product in one line
A polished library of short, interactive lessons. Spatial concepts (scaling, replication,
CDNs) are shown as **3D scenes**; conceptual ideas (comparisons, tradeoffs) as **animated 2D**.
v1 has no accounts, no AI, no backend — just content and interactivity.

## Screens to design (desktop + mobile for each)

1. **Home / Library**
   - Header with product name/logo, short tagline, and a category filter (Concepts /
     System Designs).
   - A responsive list of **lesson cards**. Each card: title, one-line summary, a
     `difficulty` pill (beginner/intermediate/advanced), and a **2D / 3D badge**.
   - Group cards by category (and optionally subcategory).
   - Mobile: single-column card list. Desktop: multi-column grid.
   - Include an empty/loading state.

2. **Lesson page — 3D concept** (reference: "Horizontal vs Vertical Scaling")
   - An interactive **3D viewport** and an **explanation panel** (rendered from MDX).
   - A small **control bar** for the scene: here, a toggle between *Scale up* and
     *Scale out*, plus reset-camera.
   - Desktop: viewport and explanation **side-by-side** (~60% visual / 40% text).
   - Mobile: viewport **stacked above** the explanation, both full-width; controls in a
     sticky bar within thumb reach; touch hint for orbit/zoom.
   - "Key takeaways" block at the end of the explanation.

3. **Lesson page — 2D concept** (reference: "What Is a Message Queue?")
   - An **animated 2D diagram**: producers → queue → consumer, with messages moving.
   - Controls: **play / pause / step**, and a **producer-rate** slider; queue visibly
     grows or drains.
   - Same responsive rule: side-by-side on desktop, stacked on mobile.

4. **App shell / navigation** shared across screens (back to library, category nav,
   light/dark support if easy).

## Aesthetic direction
- Clean, technical, confident — think a well-made developer tool, not a playful toy.
- Let the **visuals be the hero**; UI chrome stays quiet and out of the way.
- Design a small, reusable **token set**: a neutral base with one strong accent, plus a
  semantic **flow palette** reserved for animated data (e.g. request / success / failure /
  retry / cache-hit) — always paired with a second cue (shape or label), never colour alone.
- Typography: one clean sans for UI; a mono accent is welcome for labels/metrics.
- Target: **Tailwind + shadcn/ui** are the build system, so keep components, spacing, and
  radii within what those express cleanly.
- Preferred accent / mood: _______ (leave blank for a calm blue-violet technical palette).
- Light and/or dark: _______ (leave blank for both, dark as default).

## Hard requirements
- **Mobile-first and fully responsive.** Provide frames at ~375px (mobile), ~768px (tablet),
  ~1280px (desktop).
- Touch targets ≥ 44px; scene controls thumb-reachable on mobile.
- Show every meaningful **component state** (default/hover/focus/active/disabled/loading/empty).
- Include a **reduced-motion** treatment: a static first frame, no autoplay.
- Use **real example copy** (pull from the two seed lessons), not lorem ipsum, so layouts are
  validated against real text length.

## Deliverables
- Frames for all screens at all three breakpoints.
- A filled **handoff doc per screen** following `docs/DESIGN_HANDOFF.md`, including the token
  set, component states, motion specs (with reduced-motion fallbacks), and acceptance criteria.

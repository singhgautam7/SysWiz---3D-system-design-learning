# SysViz — v1 Design Handoff

**Owner:** Design · **Consumers:** Frontend (Tailwind + shadcn/ui + R3F for 3D + Framer Motion for 2D)
**Companion file:** `SysViz.dc.html` (four annotated design sections: `#1a` Library, `#2a` 3D Lesson, `#3a` 2D Lesson, `#4a` System)

---

## 0 · Product principles

1. **Visuals are the hero.** UI chrome recedes; every screen is at most one accent moment away from black.
2. **Watch, don't read.** Every concept has an animated scene. Text supports it.
3. **Every animation is labeled.** Moving particles always carry a `MSG 42`-style token or a role label — never anonymous dots.
4. **Interactive by default.** Sliders, node counts, fail-a-node, push-vs-poll — the scene reacts.
5. **No autoplay under reduced motion.** Scenes render a fully labeled static first frame.

---

## 1 · Token set

### Surfaces (AMOLED)
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#000000` | app root, saves battery on OLED, deepens 3D scenes |
| `--surface` | `#0A0B0D` | cards, panels |
| `--surface-2` | `#101215` | inputs, secondary controls |
| `--surface-3` | `#161A1F` | active tab, elevated chips |
| `--border` | `#1B1F26` | hairlines |
| `--border-2` | `#262B34` | interactive borders |
| `--border-3` | `#333947` | focused / hovered borders |

### Text
| Token | Hex |
|---|---|
| `--text` | `#F2F4F7` |
| `--text-2` | `#B8BFCC` |
| `--muted` | `#6E7787` |

### Accent — signature emerald
| Token | Hex | Use |
|---|---|---|
| `--accent` | `#00E28A` | primary action, progress, active tab underline, "success" edge in flow palette |
| `--accent-2` | `#4CFFB2` | hover, links |
| `--accent-soft` | `rgba(0,226,138,.10)` | selected row bg, badge bg |
| `--accent-glow` | `rgba(0,226,138,.35)` | focus rings, LED glow |

### Flow palette (color **+** shape, never color alone)
| Semantic | Color | Shape/glyph |
|---|---|---|
| request | `#5B8CFF` | `●` circle |
| success | `#00E28A` | `✓` check |
| failure | `#FF5A6A` | `✕` cross |
| retry / warn | `#FFB84D` | `↻` spiral |
| cache-hit | `#B48BFF` | `◆` diamond (filled) |
| cache-miss | `#B48BFF` | `◇` diamond (dashed outline) |

### Type
- **Sans:** Inter Tight (400 / 500 / 600 / 700); UI + prose. `letter-spacing:-.005em` body, `-.02em` display.
- **Mono:** JetBrains Mono (400 / 500 / 600); every metric, label, ID, `MSG` chip, timer.
- Scale: 10 (mono caps) · 11 · 12 · 13 body · 14 body-lg · 15 card-title · 22 mobile-h1 · 26 desktop-h1 · 32 hero.

### Radii · spacing · elevation
- Radii: `6 / 10 / 14 / 20` — `--r-sm / --r / --r-lg / --r-xl`
- Spacing: 4-based (Tailwind default).
- Elevation: single `--shadow-lg` `0 12px 40px rgba(0,0,0,.7)` for popovers/floating bars; no mid-tier card shadows on AMOLED — depth comes from border-hairline changes.

---

## 2 · Breakpoints

| Name | px | Grid | Notes |
|---|---|---|---|
| mobile | 375 | single column | sticky floating control bar, bottom tab nav |
| tablet | 768 | 2-col cards, side-by-side lesson at ≥900 | segmented filter in header |
| desktop | 1280 | 3-col cards, 60/40 split lesson | left-anchored viewport, right explanation |

Hit targets ≥ 44px on all touch surfaces; scene controls sit ≥ 16px from bottom safe area on mobile.

---

## 3 · Screen: Home / Library `#1a`

### Layout
- Sticky top bar: logo · nav (`Library · My progress · Favorites`) · search (`⌘K`) · theme toggle.
- Hero: title `Library` + one-line description.
- Filter row: `All · Concepts · System Designs` segmented + **grid / list toggle** + active filter pills.
- Grid view: 3 columns desktop / 2 tablet / 1 mobile. Cards grouped by `CONCEPTS` and `SYSTEM DESIGNS` with hairline dividers.
- **List view:** table row per lesson — type badge, title, difficulty, page count, duration, progress bar, favorite icon.

### Card anatomy
- Preview: 150×full-width; a mini live scene (racks / MSG chips / edge globe). Preview media = the lesson's own scene, downsampled.
- Overlay badges (top-left): **type** (`3D · INTERACTIVE` emerald or `2D · ANIMATED` violet) + **difficulty** pill.
- Favorite heart (top-right, 28×28 min, fills emerald when active).
- Body: title, one-line summary.
- Footer strip: `{pages} pages · {duration} · {progress}%` in mono; Start / Resume link.
- Bottom progress ribbon: 2px emerald bar showing % complete.

### States
- **Default / hover / focus / selected** cards per §7.
- **Loading:** 3-column skeleton with shimmering media rectangles and two text bars each.
- **Empty (filtered):** dashed 52px square icon, headline `No lessons match "{query}"`, subtitle, `Clear filters` button.

### Copy (real)
- Hero sub: "Short, interactive lessons. Spatial systems as 3D scenes you can orbit. Comparisons and flows as animated 2D. No accounts, no autoplay."
- Card examples: `Horizontal vs Vertical Scaling`, `What Is a Message Queue?`, `Caching: Hits, Misses, Evictions`, `CDN Edge Delivery`, `Replication & Consistency`, `Database Sharding`.

### Motion
- Card hover: `translateY(-2px)` + border → `--border-3` + shadow-lg in 120ms cubic-bezier(.2,.7,.2,1).
- Preview scenes autoplay at 0.5× speed on hover only; static otherwise.

### Acceptance
- 3-col grid at ≥1024, 2-col at ≥640, 1-col below.
- Every card has a distinct favorite state persisted to localStorage.
- Grid/list toggle survives reload.
- Loading skeleton renders in ≤200ms on cold cache; content swaps without layout shift.

---

## 4 · Screen: Lesson — 3D concept `#2a` (Horizontal vs Vertical Scaling)

### Structure — **multi-page lesson**
Lessons are page-collections. This one:
1. **The two shapes** — split viewport, up vs out
2. **Throughput &amp; failure** — bring load up, fail a node
3. **When to pick which** — a decision tree

Page tabs sit under the top bar; the current tab has an emerald `2px` underline and a mono `01 / 02 / 03` prefix. Right-side of tab bar: `Page X / N · %` mono readout.

### Desktop layout (1280)
Grid `62fr / 38fr`.
- **Left · viewport** (radial-gradient bg + subtle grid floor):
  - Split visually with a mid `VS` chip: **Mode A · scale up** (one tall rack) vs **Mode B · scale out** (LB + 5–6 racks).
  - Isometric racks built with real CSS 3D transforms (`rotateX(58deg) rotateZ(-42deg)` on `.stage`), gentle 12s tilt oscillation.
  - Request pulses travel LB→rack via SVG `animateMotion`.
  - Top-right HUD: `THROUGHPUT` + `p99 LATENCY` panels with sparkline.
  - Bottom-left legend for flow palette (color + shape).
  - Bottom control bar: `Scale up / Scale out / Both` segmented · `NODES −/+` stepper · reset-camera · **fail-a-node** (red).
- **Right · explanation** (MDX):
  - Type/duration badges → h1 → intro → subsections A (scale up) / B (scale out) → `TRY IT` callout → inline **YOUR NOTE** card (if the user has notes on this page) → `Key takeaways` → prev / next-page buttons.

### Mobile layout (375)
- 40px round back button · centered title stack · favorite.
- Horizontal page-tab strip (scrolls).
- Viewport 280px tall, stacked above explanation.
- Sticky **floating control bar** at bottom (16px inset) with 44px targets: `Up/Out` segmented · reset-camera · fail-node; second row: `NODES −/6/+`.
- Touch hint chip top-right of viewport: `pinch · drag`.

### Motion (3D)
- Camera orbit: dampened, max 30° from initial around Y; scroll = 0.9–1.4× dolly.
- Rack LEDs: 3 hues (`--accent`, `--req`, `--warn`), staggered 1.4s ease-in-out pulse.
- Request particles: 1.4s linear from LB to random rack, opacity fades in the last 30%.
- Node add/remove: 240ms scale-in from 0.6 with a 12° overshoot; new server "settles" onto the floor.
- Fail node: red overlay flashes twice (300ms), LEDs die, connector line dashes, HUD `p99` bumps.

### Reduced motion
- Auto-orbit off; camera holds initial isometric.
- Static first frame with all metrics visible; a `▶ Play` button re-enables motion for this session.

### Acceptance
- 60fps at 1280 with all racks, HUD, and 5 concurrent request pulses.
- All controls keyboard-reachable in tab order: page-tabs → mode → nodes → reset → fail → next-page.
- Fail-a-node changes the HUD numbers (not just visuals).
- Notes button reveals the drawer (see §6). Adding a note on page 2 shows the inline `YOUR NOTE` card only on page 2.

---

## 5 · Screen: Lesson — 2D concept `#3a` (Message Queue)

### Multi-page structure
1. **What &amp; why**
2. **One → one** (single producer, single consumer)
3. **Many → one** (fan-in, shown in the delivered frame)
4. **Many → many (fanout)** (topic + subscribers)
5. **Push vs poll**

### Desktop layout (1280)
Grid `62fr / 38fr`.
- **Left · 2D scene** (dot-grid bg):
  - Left column: 3 stacked producer cards, each labeled by service name (`payments-svc`, `orders-svc`, `emails-svc`) with an individual rate readout.
  - Center: the queue as a real stack of labeled rows `MSG 40 … MSG 45` + `+2 more`, framed by an emerald border and a `depth 8` mono readout.
  - Right: consumer card with `processing: MSG 39` panel.
  - Between queue and consumer: a `POLL every 200ms` chip (violet); toggling to push replaces with `PUSH` emerald chip and the arrow reverses direction.
  - **Message chips** are actual mono labels `MSG 44` traveling along SVG `<path>` from producer → queue → consumer via `animateMotion`. They arrive with a request-blue dot, leave with a success-green dot.
  - Top HUD: `ARRIVAL · DRAIN · DEPTH` (depth turns amber and appends ↑ growing when arrival > drain).
- **Right · explanation:** exactly the same shape as the 3D lesson; adds a `BACK-PRESSURE` warning card when drain < arrival.
- **Bottom control bar:** `⏮ Step back · ▶ Play · Step ⏭` · speed `0.5× / 1× / 2×` · `PRODUCER RATE` slider (0 – 15 msg/s).
- **Below control bar (right):** `+ add producer` · `+ add consumer` — scene grows accordingly.

### Mobile layout (375)
- Same shape as 3D mobile. Scene 280px tall; queue is compressed to 60px wide, MSG rows still labeled.
- Sticky bar: `⏮ · ▶ Play · ⏭` row, then `RATE` slider row.

### Motion (2D)
- MSG chip travel: 2.6–3.4s per hop, linear. Chip = 60×22 rounded rect with the mono label and a leading role-color dot.
- Queue rows: newest joins the top with an 180ms slide-down + fade-in; head row highlights emerald when consumed then removes with a 140ms slide-right.
- Depth pill flashes amber when it crosses 5; red at 20.
- Backpressure banner slides down 8px from the explanation top when arrival stays above drain for 3s.
- Speed control retimes all keyframes in one atomic step; no per-particle drift.

### Reduced motion
- MSG chips render at 3 static positions along each edge with full labels; Play resumes motion.
- Slider still functional (updates counts); no eased fills — bar snaps.

### Acceptance
- Chips are never anonymous — every animated element carries a mono label.
- Slider changes are reflected in `ARRIVAL` HUD within one frame.
- Adding a consumer changes drain rate arithmetic and pushes the depth trend line down.
- Pages 2–5 reuse the same viewport component with a different scene config JSON.

---

## 6 · Cross-cutting features

### Notes (Markdown)
- Drawer on the right (420px) reveals with `Notes` button; on mobile, opens as a bottom sheet at ~85vh.
- One note per page (multiple allowed). Editor supports **bold / italic / inline `code` / lists** via toolbar and standard Markdown shortcuts.
- Autosave every 800ms; footer shows `saved 3s ago`.
- Notes stored in `localStorage` under `sysviz.notes.{lessonSlug}.{pageIdx}`; export to `.md` from the drawer overflow.
- The most recent note for the current page inlines inside the explanation as a subtle emerald-tinted card.

### Favorites
- Heart icon on every card (top-right, 28×28) and in the lesson top bar (34×34).
- Filled emerald when active; outlined muted when not.
- Persisted to `localStorage.sysviz.favorites` (array of slugs).
- `Favorites` view = library filtered to that set.

### App shell / navigation
- Desktop top bar: logo · `Library / My progress / Favorites` nav · search · theme.
- Breadcrumbs in lesson top bar: `Library / Concepts / Scaling / {title}`.
- Mobile bottom nav (floating): `Library · Favorites · Progress · Settings`; single active pill with emerald surface-3.

### Theme
- Dark (AMOLED) is default. Light mode swaps `--bg → #FFFFFF`, `--surface → #F7F8FA`, `--text → #0B0D12`, `--accent → #00A85F` (WCAG AA on white). Flow palette hues shift 8% darker.

---

## 7 · Component states (all components)

| Component | default | hover | active | focus | disabled | loading | selected |
|---|---|---|---|---|---|---|---|
| Primary btn | `--accent` bg / `#001910` text | `--accent-2` bg + soft glow | `#00A85F` bg | 2px `--accent` ring offset by `--bg` | `--surface-2` / `--muted` | spinner + label | — |
| Ghost btn | transparent / border `--border-2` | bg `--surface-2` | bg `--surface-3` | ring as above | opacity .5 | spinner | — |
| Card | `--surface` / border `--border-2` | `translateY(-2px)` + `--border-3` + shadow | — | `1.5px --accent` + `0 0 0 3px accent-soft` | opacity .5 | shimmer skeleton | as focus |
| Segmented item | transparent | `--surface-2` | `--surface-3` + border | ring | muted | — | `--surface-3` + border |
| Slider | 6px `--surface-2` track | thumb enlarges 4→18px | thumb `#00A85F` | ring | track opacity .4 | — | — |
| Tab (page) | transparent / muted text | `--text-2` | — | ring | — | — | `--accent` 2px underline + `--text` |

Every focus ring: `0 0 0 2px var(--bg), 0 0 0 4px var(--accent)`.

---

## 8 · Motion specs

| Element | Duration | Easing | Reduced-motion fallback |
|---|---|---|---|
| Card hover lift | 120 ms | cubic-bezier(.2,.7,.2,1) | none |
| Card enter (grid) | 240 ms staggered 30 ms | ease-out | opacity only |
| Rack tilt | 12 s | ease-in-out infinite | disabled |
| Request pulse (3D) | 1.4 s | linear infinite | static dot at LB output |
| Node add/remove | 240 ms | cubic-bezier(.34,1.56,.64,1) | crossfade 160 ms |
| MSG chip travel | 2.6–3.4 s | linear infinite | chips fixed at 3 positions on the edge |
| Queue row enter | 180 ms | ease-out | opacity only |
| Queue row exit | 140 ms | ease-in | opacity only |
| Backpressure banner | 220 ms | ease-out | instant |
| Camera orbit | 1 frame lag from pointer | dampened lerp .12 | disabled |
| Skeleton shimmer | 1.6 s | linear infinite | solid `Loading…` label |

`prefers-reduced-motion: reduce` gates everything above through a single `<html>` root class the app writes on media-query change.

---

## 9 · Data / content shape

```ts
type Lesson = {
  slug: string;
  title: string;
  summary: string;
  category: "concepts" | "system-designs";
  subcategory: string;             // "Scaling", "Messaging", ...
  difficulty: "beginner" | "intermediate" | "advanced";
  medium: "2d" | "3d";
  durationSec: number;
  pages: Page[];
};

type Page = {
  idx: number;
  title: string;                    // "Many → one"
  mdx: string;                      // explanation body
  scene: SceneConfig;               // producers, consumers, queue.depth0, controls exposed
};

type Note = { lessonSlug: string; pageIdx: number; md: string; updatedAt: number; };
```

`SceneConfig` for the 2D queue example:
```json
{
  "type": "queue",
  "producers": [
    { "id": "payments", "label": "payments-svc", "rate": 3.2 },
    { "id": "orders",   "label": "orders-svc",   "rate": 2.1 },
    { "id": "emails",   "label": "emails-svc",   "rate": 0.9 }
  ],
  "queue":     { "topic": "events.v1", "fifo": true, "capacity": 500 },
  "consumers": [{ "id": "worker-01", "rate": 2.5, "mode": "poll", "pollMs": 200 }],
  "controls":  ["play","step","speed","producerRate","addProducer","addConsumer","togglePushPoll"]
}
```

---

## 10 · Global acceptance criteria

- Every animated element carries a label (`MSG 42`, `req`, `payments-svc`) — no anonymous shapes.
- `prefers-reduced-motion: reduce` disables autoplay and rack tilt, keeps all controls usable, and preserves labels.
- No content depends on color alone — flow palette entries always pair with a shape/glyph.
- Contrast AA: body text on `--bg` ≥ 4.5:1 (F2F4F7 = 17.4:1); mono metrics ≥ 4.5:1; accent-on-black button uses `#001910` label.
- Every screen renders at 375 / 768 / 1280 with no horizontal scroll and no clipped touch targets.
- Favorites and notes persist across reload (localStorage) and survive theme switch.
- 3D scenes fall back to a labeled static isometric SVG when WebGL is unavailable.

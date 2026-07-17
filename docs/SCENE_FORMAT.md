# SCENE_FORMAT.md — Declarative 3D Scenes (v0.1)

## Why this exists

We do **not** hand-code a bespoke Three.js scene per lesson. Instead, a 3D scene is a
**data file** describing a graph of typed nodes and edges (plus optional guided steps and
camera). A single generic renderer (`SceneRenderer`) reads that data and draws it. Adding a
new 3D lesson becomes *authoring a scene file*, not writing rendering code.

Two payoffs:
1. **Authoring speed & consistency** — new content = new data file, parsed by one renderer.
2. **Reuse for simulation** — the same node/edge graph is exactly what the phase-2
   simulation engine (`src/lib/sim`) needs. The scene file becomes the shared substrate for
   *both* rendering and simulation.

## Design principles

- **Graph-first.** Most system-design visuals are a graph of components with connections.
- **Minimal v0.1.** Only what our first lessons need. Grow the schema when a real lesson
  demands it — never speculatively.
- **Escape hatch.** Scenes that are morphs/transitions rather than graphs (e.g. a box
  *growing* for vertical scaling) use a custom-coded scene instead. See "Escape hatch".
- **Data, not code.** Same philosophy as the `dimension` field in `CONTENT_MODEL.md`.

## Format & authoring

- **Canonical format:** JSON, validated by a **zod** schema (`src/scenes/_engine/schema.ts`).
- **Authoring:** write `.scene.json` **or** `.scene.yaml` — YAML is friendlier by hand and
  your authors already write YAML frontmatter. The loader accepts either and normalises to
  JSON before validation.
- **Mermaid:** *not* the canonical format. A future convenience importer may parse a mermaid
  graph into a scene skeleton, but it is out of scope for v0.1.
- **Location:** `content/scenes/<id>.scene.json`. A lesson references it via `sceneRef`.

## Schema (v0.1)

Top level:

```jsonc
{
  "version": "0.1",
  "meta": { "id": "request-flow", "title": "Request Flow" },
  "layout": { "type": "layered", "direction": "x", "spacing": 3 },
  "nodes": [ /* Node[] */ ],
  "edges": [ /* Edge[] */ ],
  "steps": [ /* Step[]  (optional) */ ],
  "camera": { "position": [8, 6, 12], "target": [0, 0, 0] }  // optional default
}
```

### Node

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string | ✅ | Unique within the scene. |
| `type` | enum | ✅ | Maps to a mesh in the node kit (below). |
| `label` | string | ✅ | Shown on/next to the node. |
| `count` | number | ⬜ | >1 renders a fan/cluster of identical instances (a fleet). Default 1. |
| `rank` | number | ⬜ | Column index for `layered` layout (0-based, left→right). |
| `position` | [x,y,z] | ⬜ | Required only for `manual` layout; ignored for `layered`. |
| `group` | string | ⬜ | Id of a `region`/`service` node this belongs to (visually enclosed). |
| `description` | string | ⬜ | Revealed on tap/hover. |
| `accent` | string | ⬜ | Optional colour override (semantic token name, not raw hex). |

**Node `type` enum (v0.1 node kit):**
`client · load-balancer · server · service · database · cache · queue · cdn · storage · region`

`region` and `service` are **group** nodes (they visually enclose their members via `group`).
To add a new type: add a mesh to `src/scenes/_engine/nodeKit/` and extend the enum. That's
the entire cost of a new component type.

### Edge

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string | ✅ | Unique within the scene. |
| `from` | string | ✅ | Source node id. |
| `to` | string | ✅ | Target node id. |
| `flow` | enum | ⬜ | `request` \| `response` \| `replication` \| `cache` \| `async` \| `data`. Drives colour + label. Default `request`. |
| `animated` | boolean | ⬜ | If true, particles flow along the edge (respect reduced-motion). Default false. |
| `bidirectional` | boolean | ⬜ | Draw/animate both directions. Default false. |

When `from` or `to` has `count > 1`, the renderer **fans the edge to every instance**
(e.g. a load balancer to a fleet of servers).

**Flow colour palette** (always paired with a label/shape, never colour alone — see a11y):
`request` blue · `response` green · `replication` purple · `cache` yellow · `async` orange · `data` neutral.

### Step (optional — for guided walkthroughs)

Turns a static scene into a stepped narrative (great for system-design lessons like a
WhatsApp send flow). Synced with the MDX `<Step>` blocks by index.

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string | ✅ | Unique. |
| `caption` | string | ✅ | Short text shown for this step. |
| `highlight` | { nodes?: string[], edges?: string[] } | ⬜ | Ids to emphasise; everything else dims. |
| `camera` | { position, target } | ⬜ | Camera preset for this step. |

### Layout

| `type` | Behaviour |
|---|---|
| `manual` | Uses each node's `position`. Full control; more work. |
| `layered` | Auto-places by `rank` (columns along `direction`), stacking same-rank nodes; fans `count>1`. Default and recommended for v0.1. |

## Renderer contract

`SceneRenderer` lives in `src/scenes/_engine/`:

```tsx
<SceneRenderer scene={parsedScene} activeStep={n} />
```

Pipeline:
1. **Validate** the raw file with the zod schema (fail loudly with a clear message).
2. **Layout** — assign positions (`manual` reads them; `layered` computes them).
3. **Render nodes** via the node-kit registry; use **instanced meshes** when `count > 1`.
4. **Render edges** as tubes/lines; if `animated`, run flow particles (gated by
   `prefers-reduced-motion`).
5. **Steps** — if present, apply `highlight` (dim others) and move the camera per `activeStep`.
6. **Interaction** — OrbitControls with sane zoom limits; mouse + touch; tap a node to reveal
   its `description`. Dispose geometries/materials and cancel loops on unmount. `dpr={[1,2]}`.

The renderer is **generic**: it knows nothing about specific lessons. All lesson-specific
information lives in the scene file.

## Escape hatch — custom scenes

Some visuals aren't graphs (a box *growing* for vertical scaling, a consistent-hashing ring
animation). For these, a lesson sets `sceneComponent` instead of `sceneRef`, pointing at a
custom scene under `src/scenes/<id>/`. Rule of thumb: reach for a custom scene **only** when
the declarative format genuinely can't express the idea. Prefer data.

## Relationship to the simulation engine (phase 2)

The `nodes`/`edges` graph is the same topology the sim engine will operate on. When we build
`src/lib/sim`, it will consume a scene's graph, run an event queue over it (requests as
events traversing edges), and emit state the `SceneRenderer` already knows how to visualise
(node load, edge activity). Designing the scene format graph-first now is what makes that
later step cheap. Keep the scene schema free of rendering-only concerns that would pollute
the sim model.

## Versioning

The top-level `version` field is mandatory. The loader routes by version so we can evolve
the schema without breaking old files. v0.1 is the only version today.

## v0.1 non-goals (do later, only if needed)

- Mermaid/other import formats.
- Curved/custom edge routing, 3D auto-layout beyond simple `layered`.
- Per-node animation timelines (steps cover guided narratives for now).
- Physics, particles beyond simple edge flow.

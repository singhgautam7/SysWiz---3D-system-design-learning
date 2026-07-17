# SysViz — Learn System Design by Watching It Move

An interactive, visual learning platform for system design. Concepts and famous
system-design questions are explained through **3D scenes** (for spatial ideas like
scaling, replication, CDNs) and **animated 2D interactions** (for conceptual ideas
like CAP theorem or database comparisons). The goal: let people *watch distributed
systems operate*, tweak them, and build intuition faster than reading another article.

> **Status:** v1 — Interactive Visual Library. See [`docs/VISION.md`](docs/VISION.md)
> for scope and explicit non-goals.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + React 19 |
| Language | TypeScript (**strict mode**) |
| 3D | React Three Fiber + `@react-three/drei` (Three.js underneath) |
| 2D / motion | Framer Motion (GSAP only where a scene needs heavy choreography) |
| State | Zustand |
| Styling / UI | Tailwind CSS + shadcn/ui |
| Content | MDX (see [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md)) |
| Package manager / runtime | **Bun** |
| Tests | Vitest (logic), Playwright (later, for flows) |
| Hosting | Vercel |

Simulation logic (phase 2+) lives in `src/lib/sim` as **framework-agnostic TypeScript**
with zero React/Three imports, so it can be unit-tested and later extracted into its own
package if needed.

---

## Quickstart

```bash
bun install
bun run dev        # http://localhost:3000
```

`package.json` scripts use Bun as the runtime:

```jsonc
{
  "scripts": {
    "dev":   "bun --bun next dev",
    "build": "bun --bun next build",
    "start": "bun --bun next start",
    "test":  "vitest",
    "lint":  "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

To run on the Bun runtime on Vercel (optional, currently public beta), add to `vercel.json`:

```json
{ "bunVersion": "1.x" }
```

---

## Documentation

Read these before writing code or content. Every contributor's AI assistant should
be pointed at [`CLAUDE.md`](CLAUDE.md), which links out to the rest.

- [`docs/VISION.md`](docs/VISION.md) — what we're building and, more importantly, what we're **not**.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — stack, folder conventions, the simulation boundary.
- [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md) — the MDX schema (the most important doc for content authors).
- [`docs/SCENE_FORMAT.md`](docs/SCENE_FORMAT.md) — the declarative 3D scene format + generic renderer.
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — coding + performance guidelines, Definition of Done, PR checklist, **content-review gate**.
- [`docs/DESIGN_HANDOFF.md`](docs/DESIGN_HANDOFF.md) — the template every design handoff must follow.
- [`specs/`](specs/) — one spec file per feature. Start with [`specs/000-vertical-slice.md`](specs/000-vertical-slice.md).
- [`prompts/`](prompts/) — reusable design & code prompts for generating work with an LLM.

## Repo layout

```
CLAUDE.md
docs/
specs/
content/
  concepts/          # "what is X" — message queues, DB types, caching…
  system-designs/    # whatsapp, youtube, url shortener…
prompts/
src/
  app/               # Next.js routes
  components/        # shared UI (2D)
  scenes/            # 3D scenes (React Three Fiber)
  lib/
    content/         # MDX loading + schema validation
    sim/             # framework-agnostic simulation engine (phase 2+)
```

## License

MIT (intended open source). See `LICENSE`.

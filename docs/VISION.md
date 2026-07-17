# VISION.md

## The problem

Almost every system-design explanation is **static**: articles, diagrams, slide decks.
But system design is fundamentally about *movement* — requests, replication, failures,
scaling, queues, retries, consensus. Those ideas are hard precisely because they're
temporal and spatial, not textual. Static media force the learner to simulate the motion
in their head.

## The bet

If a learner can **watch** a request flow through a load balancer, see a cache absorb
traffic, drag a "users/sec" slider and watch queues back up, or kill a region and see
traffic reroute — they build intuition far faster than by reading. People remember
motion better than diagrams.

## What we're building (the north star)

A platform with two kinds of lessons:

- **Concepts** — "what is a message queue", types of databases, caching strategies,
  load balancing, replication, sharding, consistent hashing, CDNs, DNS. Small, focused,
  one idea each.
- **System Designs** — end-to-end walkthroughs of famous systems (WhatsApp, YouTube,
  a URL shortener, Instagram) shown as animated data flows a learner can step through.

Some lessons are **3D** (spatial ideas); others are **animated 2D** (conceptual ideas).
Choosing the right dimension per lesson is a core design principle, not an afterthought.

## v1 scope (what we ship first)

**Phase 1 — Interactive Visual Library.** A polished, navigable library of lessons:

1. A home / library page listing lessons by category and difficulty.
2. A lesson page that renders MDX content alongside an interactive visual.
3. **Two reference lessons** proving the format end-to-end:
   - **3D:** Horizontal vs Vertical Scaling (interactive R3F scene).
   - **2D:** Message Queue (animated, interactive cards/timeline).
4. The content pipeline: MDX + frontmatter schema + validation.
5. Responsive design working on web **and** mobile.

That's it. v1 proves the *format teaches well* before we build anything harder.

## Explicit NON-goals for v1 (do not build these yet)

- ❌ **No AI features.** No AI tutor, no AI interviewer/reviewer. If added later, it will
  be **user-supplied API key only** (no server-side keys, no cost to us).
- ❌ **No simulation engine yet.** The drag-a-slider / kill-a-node / particle-flow
  simulator is phase 2+. We reserve `src/lib/sim` for it but do not build it in v1.
- ❌ **No system builder** (drag-and-drop architecture canvas). Phase 3.
- ❌ **No accounts, auth, database, or backend.** v1 is static content + client-side interactivity.
- ❌ **No community / publishing / multiplayer.**
- ❌ **No "language internals" section** (garbage collectors, goroutines, event loops).
  *Noted for a future "Fundamentals" section — see `docs/CONTRIBUTING.md` → Backlog. Not v1.*

## Roadmap (post-v1, rough order)

1. **v1 — Interactive Visual Library** ← we are here
2. Guided Simulations (sliders → live system behaviour; the `sim` engine)
3. Failure Mode (kill a node/region, watch reroute) + Time Travel (system evolution slider)
4. Complexity Slider (beginner/intermediate/advanced views of the same system)
5. System Builder (drag-and-drop canvas)
6. Optional AI Reviewer / Interview Mode (BYO API key)
7. Fundamentals section (GC, goroutines, event loop, etc.)
8. Community publishing

## Success criteria for v1

- A developer who has never used the site can open a lesson and, without instructions,
  interact with the visual and come away understanding the concept.
- People **share it** because it's genuinely useful, not just because it looks cool.
- The content pipeline lets a second contributor add a lesson without touching anyone
  else's files.

## Content quality bar

Take structural cues from strong existing resources (e.g. NeetCode, Hello Interview) for
*what* to cover and *how deep*, but write original explanations and visuals. Every lesson
must pass a human accuracy review before merge (see `docs/CONTRIBUTING.md`).

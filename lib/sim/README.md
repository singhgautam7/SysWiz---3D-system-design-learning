# `lib/sim` — Simulation engine (PHASE 2+, intentionally empty)

This folder is **reserved** for the phase-2 simulation engine and is deliberately
empty in v1. Do not build the engine here yet (see `docs/VISION.md` non-goals).

## The import boundary (hard rule)

When the engine is built, it must stay **framework-agnostic** so it can be
unit-tested without a browser and later extracted into a package:

- `lib/sim/**` **may** import: standard TypeScript, small pure utilities.
- `lib/sim/**` may **NOT** import: `react`, `three`, `@react-three/*`, `next/*`,
  or anything touching the DOM.

The engine will expose plain data + `subscribe`/`step` APIs. Scenes read engine
state and render it; they never push rendering concerns into the engine.

The declarative scene graph (`content/scenes/*.scene.json`, see
`docs/SCENE_FORMAT.md`) is the shared substrate: the same `nodes`/`edges` topology
the `SceneRenderer` draws is what this engine will run an event queue over.

# CONTENT_MODEL.md

The most important contract in the project. A **lesson is a single MDX file** with typed
frontmatter plus a body. Authors work in parallel without touching each other's files or
any component code. Rendering reads the frontmatter to decide what to show.

## Where content lives

```
content/
  concepts/<slug>.mdx        # focused single ideas
  system-designs/<slug>.mdx  # end-to-end system walkthroughs
```

The filename (without `.mdx`) is the URL slug and must match the `id` frontmatter field.

## Frontmatter schema

Every lesson file starts with YAML frontmatter validated by `src/lib/content/schema.ts`
(zod). Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string (kebab-case) | ✅ | Must equal the filename slug. Stable; don't rename casually. |
| `title` | string | ✅ | Display title, e.g. "Horizontal vs Vertical Scaling". |
| `summary` | string | ✅ | One–two sentences for cards and SEO. |
| `category` | enum | ✅ | `concept` \| `system-design`. |
| `subcategory` | string | ⬜ | e.g. `scaling`, `databases`, `messaging`, `caching`. Used for grouping. |
| `dimension` | enum | ✅ | `2d` \| `3d`. Decides which visual pipeline renders. |
| `sceneRef` | string | conditional | For `dimension: 3d`: id of a **declarative scene file** at `content/scenes/<sceneRef>.scene.json`, rendered by the generic `SceneRenderer`. See `docs/SCENE_FORMAT.md`. Provide this **or** `sceneComponent`. |
| `sceneComponent` | string | conditional | For `dimension: 3d` **escape hatch only**: name of a custom-coded scene under `src/scenes/<id>/`, used when the visual is a morph/transition the declarative format can't express (e.g. vertical-scaling "box grows"). Prefer `sceneRef`. |
| `componentRef` | string | conditional | **Required if `dimension: 2d`.** Exported widget name from `src/components`. |
| `difficulty` | enum | ✅ | `beginner` \| `intermediate` \| `advanced`. |
| `tags` | string[] | ⬜ | Free-form, e.g. `["latency", "redis"]`. |
| `estMinutes` | number | ⬜ | Rough read/interact time. |
| `related` | string[] | ⬜ | Other lesson `id`s. |
| `reviewStatus` | enum | ✅ | `draft` \| `needs-review` \| `reviewed`. **Only `reviewed` may ship to prod.** |
| `authors` | string[] | ⬜ | GitHub handles. |
| `updated` | string (ISO date) | ✅ | Last meaningful edit. |

### The `dimension` field is the whole point

`dimension` is how "should this be 3D or 2D?" becomes a **data choice**, not a code fork.
Guidance for authors:

- Use **`3d`** for spatial concepts: scaling, replication, sharding, consistent hashing,
  load balancing, CDNs, DNS resolution, multi-region, Kafka/queues topology, service mesh,
  failover, data centers.
- Use **`2d`** for conceptual/tabular ideas: CAP theorem, SQL vs NoSQL, ACID, indexes,
  B+ trees, auth/OAuth/JWT, database comparisons.

If in doubt, ask: *does spatial position/motion carry meaning?* If yes → 3D. If it's a
comparison, tradeoff table, or timeline → 2D.

## Body conventions

The MDX body is the explanation. It may use a small set of **approved custom components**
(registered in the MDX provider) so lessons stay consistent:

- `<Callout type="info|warn|tip">…</Callout>`
- `<Step n={1} title="…">…</Step>` — for ordered walkthroughs (great for system designs).
- `<Compare>` — two-column tradeoff blocks (great for 2D concept lessons).
- `<KeyTakeaways>` — bulleted summary; every lesson should end with this.

Do **not** invent new components inline in content. If a lesson needs a new building block,
propose it in a PR that adds it to the provider first.

## Example — 3D concept

See `content/concepts/horizontal-vs-vertical-scaling.mdx`.

## Example — 2D concept

See `content/concepts/message-queue.mdx`.

## Validation

`bun run content:check` (script added with the content pipeline) runs the zod schema over
every file and fails if:

- `id` ≠ filename,
- `dimension: 3d` with neither a matching `content/scenes/<sceneRef>.scene.json` nor a `sceneComponent` under `src/scenes/`,
- `dimension: 2d` without a matching `componentRef`,
- `reviewStatus: reviewed` but no reviewer recorded in the PR (checked in CI),
- any required field missing.

This runs in CI so broken content can't merge.

import path from "node:path";

/**
 * Repo root. Uses `process.cwd()` rather than `__dirname`: Next.js (dev, build,
 * and start), the content:check script, and Vitest all run with cwd at the
 * project root, whereas `__dirname` shifts under Turbopack/webpack bundling.
 */
export const REPO_ROOT = process.cwd();

export const CONTENT_DIR = path.join(REPO_ROOT, "content");
export const CONCEPTS_DIR = path.join(CONTENT_DIR, "concepts");
export const SYSTEM_DESIGNS_DIR = path.join(CONTENT_DIR, "system-designs");
export const SCENES_DIR = path.join(CONTENT_DIR, "scenes");
/** Custom-coded scenes (the `sceneComponent` escape hatch) live here. */
export const CUSTOM_SCENES_DIR = path.join(REPO_ROOT, "scenes");

export const CATEGORY_DIRS = {
  concept: CONCEPTS_DIR,
  "system-design": SYSTEM_DESIGNS_DIR,
} as const;

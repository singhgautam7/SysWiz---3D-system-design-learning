import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

import { sceneSchema, type Scene } from "./schema";

/**
 * Validate an already-parsed object against the scene schema.
 * Throws with a clear, source-attributed message on failure (fail loudly).
 */
export function parseScene(raw: unknown, source = "scene"): Scene {
  const result = sceneSchema.safeParse(raw);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid scene "${source}":\n${detail}`);
  }
  return result.data;
}

/** Parse a raw JSON or YAML scene string. Format chosen by file extension. */
export function loadSceneFromString(text: string, filename: string): Scene {
  const isYaml = /\.ya?ml$/.test(filename) || /\.scene\.ya?ml$/.test(filename);
  let raw: unknown;
  try {
    raw = isYaml ? parseYaml(text) : JSON.parse(text);
  } catch (err) {
    const kind = isYaml ? "YAML" : "JSON";
    throw new Error(
      `Failed to parse ${kind} scene "${filename}": ${(err as Error).message}`,
    );
  }
  return parseScene(raw, filename);
}

// cwd-relative (see lib/content/paths.ts) so it resolves under bundling.
const SCENES_DIR = path.resolve(process.cwd(), "content", "scenes");

/**
 * Read + validate a scene file by `sceneRef` from content/scenes/.
 * Accepts `.scene.json`, `.scene.yaml`, or `.scene.yml`. Server/Node only.
 */
export function loadSceneByRef(sceneRef: string): Scene {
  const candidates = [
    `${sceneRef}.scene.json`,
    `${sceneRef}.scene.yaml`,
    `${sceneRef}.scene.yml`,
  ];
  for (const name of candidates) {
    const full = path.join(SCENES_DIR, name);
    if (fs.existsSync(full)) {
      return loadSceneFromString(fs.readFileSync(full, "utf8"), name);
    }
  }
  throw new Error(
    `No scene file found for sceneRef "${sceneRef}" (looked for ${candidates.join(", ")} in content/scenes/)`,
  );
}

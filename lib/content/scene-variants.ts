/**
 * Optional per-lesson scene variants for 3D lessons. A lesson whose id appears
 * here renders a variant switcher in its chrome (each entry is one scene file).
 * Lessons not listed render their single `sceneRef`.
 *
 * The scaling lesson uses this to toggle "scale out" (the authored fleet scene)
 * vs "scale up" (a separate, single-bigger-server scene) — both drawn by the
 * same generic SceneRenderer, proving the format is lesson-agnostic.
 */
export const SCENE_VARIANTS: Record<
  string,
  { label: string; sceneRef: string }[]
> = {
  "horizontal-vs-vertical-scaling": [
    { label: "Scale out", sceneRef: "horizontal-vs-vertical-scaling" },
    { label: "Scale up", sceneRef: "vertical-scaling" },
  ],
};

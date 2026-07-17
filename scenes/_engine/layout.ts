import type { Scene, SceneNode } from "./schema";

export type Vec3 = [number, number, number];

export interface NodeLayout {
  /** Geometric centre of the node (average of its instances). */
  center: Vec3;
  /** One position per rendered instance. `count > 1` fans into several. */
  instances: Vec3[];
}

export type SceneLayout = Map<string, NodeLayout>;

const AXIS_INDEX = { x: 0, y: 1, z: 2 } as const;

/** Axis (index) along which same-rank nodes stack / fleets fan, per direction. */
function crossAxisIndex(direction: "x" | "y" | "z"): 0 | 1 | 2 {
  // direction x → stack vertically (y); y → stack along x; z → stack vertically (y).
  return direction === "y" ? 0 : 1;
}

function nodeCount(node: SceneNode): number {
  return node.count && node.count > 0 ? node.count : 1;
}

/**
 * Assign a world position to every node (and every instance of a fleet).
 * - `manual`: reads each node's `position` (required; throws if missing).
 * - `layered`: columns by `rank` along `direction`, same-rank nodes and
 *   `count > 1` fleets fanned and centred on the cross axis.
 */
export function computeLayout(scene: Scene): SceneLayout {
  if (scene.layout.type === "manual") return manualLayout(scene);
  return layeredLayout(scene);
}

function manualLayout(scene: Scene): SceneLayout {
  const out: SceneLayout = new Map();
  for (const node of scene.nodes) {
    if (!node.position) {
      throw new Error(
        `Scene "${scene.meta.id}" uses manual layout but node "${node.id}" has no position.`,
      );
    }
    const center = node.position as Vec3;
    const n = nodeCount(node);
    const instances: Vec3[] = [];
    // Fan manual fleets along +x so `count > 1` still renders multiple meshes.
    for (let i = 0; i < n; i++) {
      const offset = (i - (n - 1) / 2) * 1.4;
      instances.push([center[0], center[1] + offset, center[2]]);
    }
    out.set(node.id, { center, instances });
  }
  return out;
}

function layeredLayout(scene: Scene): SceneLayout {
  const rankAxis = AXIS_INDEX[scene.layout.direction];
  const crossAxis = crossAxisIndex(scene.layout.direction);
  const rankSpacing = scene.layout.spacing;
  const crossSpacing = scene.layout.spacing * 0.9;

  // Group nodes by rank (missing rank defaults to 0).
  const byRank = new Map<number, SceneNode[]>();
  for (const node of scene.nodes) {
    const rank = node.rank ?? 0;
    const bucket = byRank.get(rank);
    if (bucket) bucket.push(node);
    else byRank.set(rank, [node]);
  }

  const out: SceneLayout = new Map();
  for (const [rank, nodes] of byRank) {
    // Expand fleets: one slot per rendered instance, laid out along the cross axis.
    const items: { node: SceneNode }[] = [];
    for (const node of nodes) {
      for (let i = 0; i < nodeCount(node); i++) items.push({ node });
    }
    const total = items.length;

    const perNodeInstances = new Map<string, Vec3[]>();
    items.forEach((item, k) => {
      const pos: Vec3 = [0, 0, 0];
      pos[rankAxis] = rank * rankSpacing;
      pos[crossAxis] = (k - (total - 1) / 2) * crossSpacing;
      const list = perNodeInstances.get(item.node.id) ?? [];
      list.push(pos);
      perNodeInstances.set(item.node.id, list);
    });

    for (const node of nodes) {
      const instances = perNodeInstances.get(node.id) ?? [];
      out.set(node.id, { center: averageVec(instances), instances });
    }
  }
  return out;
}

function averageVec(vecs: Vec3[]): Vec3 {
  if (vecs.length === 0) return [0, 0, 0];
  const sum: Vec3 = [0, 0, 0];
  for (const v of vecs) {
    sum[0] += v[0];
    sum[1] += v[1];
    sum[2] += v[2];
  }
  return [sum[0] / vecs.length, sum[1] / vecs.length, sum[2] / vecs.length];
}

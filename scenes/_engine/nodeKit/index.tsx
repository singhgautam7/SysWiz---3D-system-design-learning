import type { ReactElement } from "react";
import type { NodeType, FlowType } from "../schema";

/**
 * The node kit: one small mesh per node `type` in the v0.1 enum, registered in
 * a single lookup. Geometry is returned as a JSX element so React Three Fiber
 * owns disposal (no manual geometry/material cleanup needed).
 *
 * Adding a new component type is exactly: add an entry here + extend the enum
 * in schema.ts. Nothing else in the renderer changes.
 */

export interface NodeKitEntry {
  /** Geometry element, reused for both single meshes and instanced fleets. */
  geometry: () => ReactElement;
  /** Semantic base colour (hex). Paired with the always-visible label. */
  color: string;
  /** Half-height of the mesh — where the floating label sits. */
  labelY: number;
  /** Group/container nodes (region, service) render as translucent platforms. */
  container?: boolean;
}

export const nodeKit: Record<NodeType, NodeKitEntry> = {
  client: {
    geometry: () => <boxGeometry args={[0.9, 0.9, 0.9]} />,
    color: "#5B8CFF",
    labelY: 0.75,
  },
  "load-balancer": {
    geometry: () => <octahedronGeometry args={[0.7]} />,
    color: "#4CFFB2",
    labelY: 0.9,
  },
  server: {
    geometry: () => <boxGeometry args={[0.85, 1.25, 0.85]} />,
    color: "#00E28A",
    labelY: 0.9,
  },
  service: {
    geometry: () => <boxGeometry args={[1.1, 1.1, 1.1]} />,
    color: "#7C8BA1",
    labelY: 0.85,
    container: true,
  },
  database: {
    geometry: () => <cylinderGeometry args={[0.6, 0.6, 1.15, 28]} />,
    color: "#B48BFF",
    labelY: 0.85,
  },
  cache: {
    geometry: () => <icosahedronGeometry args={[0.7]} />,
    color: "#FFD24D",
    labelY: 0.85,
  },
  queue: {
    geometry: () => <boxGeometry args={[1.7, 0.6, 0.6]} />,
    color: "#FFB84D",
    labelY: 0.55,
  },
  cdn: {
    geometry: () => <sphereGeometry args={[0.72, 28, 18]} />,
    color: "#5BD1FF",
    labelY: 0.85,
  },
  storage: {
    geometry: () => <cylinderGeometry args={[0.78, 0.78, 0.42, 28]} />,
    color: "#B8BFCC",
    labelY: 0.5,
  },
  region: {
    geometry: () => <boxGeometry args={[2.4, 0.12, 2.4]} />,
    color: "#333947",
    labelY: 0.3,
    container: true,
  },
};

/** Flow palette (colour + glyph). Colour is never the only signal. */
export const flowStyle: Record<FlowType, { color: string; glyph: string; label: string }> = {
  request: { color: "#5B8CFF", glyph: "●", label: "request" },
  response: { color: "#00E28A", glyph: "✓", label: "response" },
  replication: { color: "#B48BFF", glyph: "⇄", label: "replication" },
  cache: { color: "#FFD24D", glyph: "◆", label: "cache" },
  async: { color: "#FFB84D", glyph: "↻", label: "async" },
  data: { color: "#B8BFCC", glyph: "▪", label: "data" },
};

import { describe, it, expect } from "vitest";
import { parseScene, loadSceneFromString, loadSceneByRef } from "./loader";
import { computeLayout } from "./layout";

const validJson = JSON.stringify({
  version: "0.1",
  meta: { id: "x", title: "X" },
  layout: { type: "layered", direction: "x", spacing: 3 },
  nodes: [{ id: "a", type: "client", label: "A", rank: 0 }],
  edges: [],
});

describe("scene loader", () => {
  it("parses valid JSON", () => {
    const scene = loadSceneFromString(validJson, "x.scene.json");
    expect(scene.meta.id).toBe("x");
  });

  it("parses equivalent YAML", () => {
    const yaml = `
version: "0.1"
meta: { id: y, title: Y }
layout: { type: layered, direction: x, spacing: 3 }
nodes:
  - { id: a, type: client, label: A, rank: 0 }
`;
    const scene = loadSceneFromString(yaml, "y.scene.yaml");
    expect(scene.meta.id).toBe("y");
    expect(scene.edges).toEqual([]);
  });

  it("applies schema defaults (edge flow/animated, layout spacing)", () => {
    const scene = parseScene({
      version: "0.1",
      meta: { id: "z", title: "Z" },
      layout: { type: "layered" },
      nodes: [
        { id: "a", type: "client", label: "A", rank: 0 },
        { id: "b", type: "database", label: "B", rank: 1 },
      ],
      edges: [{ id: "e", from: "a", to: "b" }],
    });
    expect(scene.layout.direction).toBe("x");
    expect(scene.layout.spacing).toBe(3);
    expect(scene.edges[0]!.flow).toBe("request");
    expect(scene.edges[0]!.animated).toBe(false);
  });

  it("throws a clear error on an unknown node type", () => {
    expect(() =>
      parseScene({
        version: "0.1",
        meta: { id: "z", title: "Z" },
        layout: { type: "layered" },
        nodes: [{ id: "a", type: "wormhole", label: "A" }],
      }),
    ).toThrow(/Invalid scene/);
  });

  it("throws on a wrong version", () => {
    expect(() =>
      parseScene({
        version: "0.2",
        meta: { id: "z", title: "Z" },
        layout: { type: "layered" },
        nodes: [{ id: "a", type: "client", label: "A" }],
      }),
    ).toThrow(/Invalid scene/);
  });

  it("loads both seed scene files by ref and lays them out (generic renderer proof)", () => {
    for (const ref of ["horizontal-vs-vertical-scaling", "vertical-scaling"]) {
      const scene = loadSceneByRef(ref);
      const layout = computeLayout(scene);
      expect(layout.size).toBe(scene.nodes.length);
    }
  });
});

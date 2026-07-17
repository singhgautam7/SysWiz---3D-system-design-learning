import { describe, it, expect } from "vitest";
import { computeLayout } from "./layout";
import { parseScene } from "./loader";
import type { Scene } from "./schema";

function makeScene(partial: Partial<Scene> = {}): Scene {
  return parseScene({
    version: "0.1",
    meta: { id: "t", title: "T" },
    layout: { type: "layered", direction: "x", spacing: 3 },
    nodes: [
      { id: "a", type: "client", label: "A", rank: 0 },
      { id: "b", type: "server", label: "B", rank: 1, count: 3 },
    ],
    edges: [],
    ...partial,
  });
}

describe("computeLayout — layered", () => {
  it("places ranks along the direction axis", () => {
    const layout = computeLayout(makeScene());
    expect(layout.get("a")!.center[0]).toBe(0);
    expect(layout.get("b")!.center[0]).toBe(3);
  });

  it("fans a count>1 node into that many instances", () => {
    const layout = computeLayout(makeScene());
    const b = layout.get("b")!;
    expect(b.instances).toHaveLength(3);
  });

  it("centres a fleet on the cross axis (symmetric around 0)", () => {
    const layout = computeLayout(makeScene());
    const ys = layout.get("b")!.instances.map((p) => p[1]);
    expect(ys[0]).toBeCloseTo(-ys[2]!);
    expect(layout.get("b")!.center[1]).toBeCloseTo(0);
  });

  it("gives a single node exactly one instance at its centre", () => {
    const layout = computeLayout(makeScene());
    const a = layout.get("a")!;
    expect(a.instances).toHaveLength(1);
    expect(a.instances[0]).toEqual(a.center);
  });
});

describe("computeLayout — manual", () => {
  it("reads authored positions", () => {
    const scene = makeScene({
      layout: { type: "manual", direction: "x", spacing: 3 },
      nodes: [
        { id: "a", type: "client", label: "A", position: [1, 2, 3] },
      ],
    });
    const layout = computeLayout(scene);
    expect(layout.get("a")!.center).toEqual([1, 2, 3]);
  });

  it("throws when a manual node lacks a position", () => {
    const scene = makeScene({
      layout: { type: "manual", direction: "x", spacing: 3 },
      nodes: [{ id: "a", type: "client", label: "A", rank: 0 }],
    });
    expect(() => computeLayout(scene)).toThrow(/no position/);
  });
});

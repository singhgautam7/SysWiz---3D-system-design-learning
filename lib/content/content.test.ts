import { describe, it, expect } from "vitest";
import { lessonFrontmatterSchema } from "./schema";
import { validateAllContent, listLessons } from "./load";

const base = {
  id: "example-lesson",
  title: "Example Lesson",
  summary: "A summary.",
  category: "concept" as const,
  difficulty: "beginner" as const,
  reviewStatus: "needs-review" as const,
  updated: "2026-07-16",
};

describe("lessonFrontmatterSchema", () => {
  it("accepts a valid 3d lesson with sceneRef", () => {
    const r = lessonFrontmatterSchema.safeParse({
      ...base,
      dimension: "3d",
      sceneRef: "example-lesson",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a valid 2d lesson with componentRef", () => {
    const r = lessonFrontmatterSchema.safeParse({
      ...base,
      dimension: "2d",
      componentRef: "ExampleViz",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a 3d lesson with neither sceneRef nor sceneComponent", () => {
    const r = lessonFrontmatterSchema.safeParse({ ...base, dimension: "3d" });
    expect(r.success).toBe(false);
  });

  it("rejects a 2d lesson without a componentRef", () => {
    const r = lessonFrontmatterSchema.safeParse({ ...base, dimension: "2d" });
    expect(r.success).toBe(false);
  });

  it("rejects a non-kebab-case id", () => {
    const r = lessonFrontmatterSchema.safeParse({
      ...base,
      id: "Example_Lesson",
      dimension: "2d",
      componentRef: "X",
    });
    expect(r.success).toBe(false);
  });

  it("rejects reviewStatus 'reviewed' without a reviewer", () => {
    const r = lessonFrontmatterSchema.safeParse({
      ...base,
      reviewStatus: "reviewed",
      dimension: "2d",
      componentRef: "X",
    });
    expect(r.success).toBe(false);
  });

  it("accepts reviewStatus 'reviewed' with a reviewer", () => {
    const r = lessonFrontmatterSchema.safeParse({
      ...base,
      reviewStatus: "reviewed",
      reviewers: ["@alice"],
      dimension: "2d",
      componentRef: "X",
    });
    expect(r.success).toBe(true);
  });

  it("normalises a Date `updated` into an ISO date string", () => {
    const r = lessonFrontmatterSchema.safeParse({
      ...base,
      updated: new Date("2026-07-16T00:00:00Z"),
      dimension: "2d",
      componentRef: "X",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.updated).toBe("2026-07-16");
  });

  it("rejects a bad date format", () => {
    const r = lessonFrontmatterSchema.safeParse({
      ...base,
      updated: "16/07/2026",
      dimension: "2d",
      componentRef: "X",
    });
    expect(r.success).toBe(false);
  });
});

describe("seed content", () => {
  it("passes content:check with zero errors", () => {
    expect(validateAllContent()).toEqual([]);
  });

  it("loads exactly the two seed lessons", () => {
    const lessons = listLessons();
    const ids = lessons.map((l) => l.frontmatter.id).sort();
    expect(ids).toEqual([
      "horizontal-vs-vertical-scaling",
      "message-queue",
    ]);
  });

  it("wires the 3d lesson to a scene file and the 2d lesson to a component", () => {
    const lessons = listLessons();
    const scaling = lessons.find(
      (l) => l.frontmatter.id === "horizontal-vs-vertical-scaling",
    );
    const queue = lessons.find((l) => l.frontmatter.id === "message-queue");
    expect(scaling?.frontmatter.dimension).toBe("3d");
    expect(scaling?.frontmatter.sceneRef).toBe(
      "horizontal-vs-vertical-scaling",
    );
    expect(queue?.frontmatter.dimension).toBe("2d");
    expect(queue?.frontmatter.componentRef).toBe("MessageQueueViz");
  });
});

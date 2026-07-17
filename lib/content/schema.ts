import { z } from "zod";

/**
 * Lesson frontmatter schema — the single most important contract in the repo.
 * Mirrors docs/CONTENT_MODEL.md field-for-field.
 *
 * Deviation (documented): CONTENT_MODEL.md requires `content:check` to fail on
 * `reviewStatus: reviewed` with "no reviewer recorded". The field table doesn't
 * define where a reviewer is recorded, so we add an optional `reviewers: string[]`
 * frontmatter field and require it to be non-empty when `reviewStatus === "reviewed"`.
 * This makes the rule checkable deterministically without git/PR context. Lessons
 * that aren't `reviewed` never need it.
 */

const kebabCase = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "must be kebab-case (lowercase letters, numbers, single hyphens)",
  );

// YAML auto-parses unquoted `2026-07-16` into a JS Date; normalise back to an
// ISO date string (YYYY-MM-DD) before validating.
const isoDate = z.preprocess(
  (value) => {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return value;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)"),
);

export const categoryEnum = z.enum(["concept", "system-design"]);
export const dimensionEnum = z.enum(["2d", "3d"]);
export const difficultyEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export const reviewStatusEnum = z.enum(["draft", "needs-review", "reviewed"]);

export const lessonFrontmatterSchema = z
  .object({
    id: kebabCase,
    title: z.string().min(1),
    summary: z.string().min(1),
    category: categoryEnum,
    subcategory: z.string().min(1).optional(),
    dimension: dimensionEnum,
    sceneRef: z.string().min(1).optional(),
    sceneComponent: z.string().min(1).optional(),
    componentRef: z.string().min(1).optional(),
    difficulty: difficultyEnum,
    tags: z.array(z.string()).optional(),
    estMinutes: z.number().optional(),
    related: z.array(z.string()).optional(),
    reviewStatus: reviewStatusEnum,
    reviewers: z.array(z.string()).optional(),
    authors: z.array(z.string()).optional(),
    updated: isoDate,
  })
  .superRefine((data, ctx) => {
    if (data.dimension === "3d" && !data.sceneRef && !data.sceneComponent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "dimension '3d' requires either `sceneRef` (declarative scene) or `sceneComponent` (custom scene escape hatch)",
        path: ["sceneRef"],
      });
    }
    if (data.dimension === "2d" && !data.componentRef) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "dimension '2d' requires a `componentRef`",
        path: ["componentRef"],
      });
    }
    if (
      data.reviewStatus === "reviewed" &&
      (!data.reviewers || data.reviewers.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "reviewStatus 'reviewed' requires at least one recorded reviewer in `reviewers`",
        path: ["reviewers"],
      });
    }
  });

export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
export type Category = z.infer<typeof categoryEnum>;
export type Dimension = z.infer<typeof dimensionEnum>;
export type Difficulty = z.infer<typeof difficultyEnum>;

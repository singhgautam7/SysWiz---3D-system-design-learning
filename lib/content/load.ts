import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import {
  lessonFrontmatterSchema,
  type Category,
  type LessonFrontmatter,
} from "./schema";
import { CATEGORY_DIRS, SCENES_DIR, CUSTOM_SCENES_DIR } from "./paths";

export interface Lesson {
  /** URL slug — the filename without `.mdx`; equals `frontmatter.id`. */
  slug: string;
  category: Category;
  frontmatter: LessonFrontmatter;
  /** Raw MDX body (no frontmatter). */
  body: string;
  /** Absolute path to the source file, for diagnostics. */
  filePath: string;
}

/** Client-safe lesson shape (no MDX body / absolute paths). */
export type LessonSummary = Pick<Lesson, "slug" | "category" | "frontmatter">;

export function toLessonSummary(lesson: Lesson): LessonSummary {
  return {
    slug: lesson.slug,
    category: lesson.category,
    frontmatter: lesson.frontmatter,
  };
}

export function listLessonSummaries(): LessonSummary[] {
  return listLessons().map(toLessonSummary);
}

export interface ContentError {
  filePath: string;
  message: string;
}

const CATEGORIES: Category[] = ["concept", "system-design"];

function listMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => path.join(dir, f))
    .sort();
}

/** Does a declarative scene file exist for the given `sceneRef`? */
export function sceneFileExists(sceneRef: string): boolean {
  return (
    fs.existsSync(path.join(SCENES_DIR, `${sceneRef}.scene.json`)) ||
    fs.existsSync(path.join(SCENES_DIR, `${sceneRef}.scene.yaml`)) ||
    fs.existsSync(path.join(SCENES_DIR, `${sceneRef}.scene.yml`))
  );
}

/** Does a custom scene folder exist under `scenes/<id>/`? */
export function customSceneExists(id: string): boolean {
  const dir = path.join(CUSTOM_SCENES_DIR, id);
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

interface ParsedFile {
  slug: string;
  category: Category;
  filePath: string;
  data: Record<string, unknown>;
  body: string;
}

function parseFiles(): ParsedFile[] {
  const out: ParsedFile[] = [];
  for (const category of CATEGORIES) {
    const dir = CATEGORY_DIRS[category];
    for (const filePath of listMdxFiles(dir)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      out.push({
        slug: path.basename(filePath, ".mdx"),
        category,
        filePath,
        data,
        body: content,
      });
    }
  }
  return out;
}

/**
 * Validate every content file against the schema and the cross-file rules
 * (id≠filename, missing scene, category mismatch, ...). Returns all errors
 * rather than throwing, so the `content:check` script can report them together.
 */
export function validateAllContent(): ContentError[] {
  const errors: ContentError[] = [];
  for (const file of parseFiles()) {
    const parsed = lessonFrontmatterSchema.safeParse(file.data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const where = issue.path.length ? ` (${issue.path.join(".")})` : "";
        errors.push({
          filePath: file.filePath,
          message: `${issue.message}${where}`,
        });
      }
      continue;
    }
    const fm = parsed.data;

    if (fm.id !== file.slug) {
      errors.push({
        filePath: file.filePath,
        message: `id "${fm.id}" must equal the filename slug "${file.slug}"`,
      });
    }

    if (fm.category !== file.category) {
      errors.push({
        filePath: file.filePath,
        message: `category "${fm.category}" must match the folder ("${file.category}")`,
      });
    }

    if (fm.dimension === "3d") {
      const hasScene = fm.sceneRef ? sceneFileExists(fm.sceneRef) : false;
      const hasCustom = fm.sceneComponent
        ? customSceneExists(fm.sceneComponent)
        : false;
      if (!hasScene && !hasCustom) {
        const detail = fm.sceneRef
          ? `no scene file at content/scenes/${fm.sceneRef}.scene.json`
          : fm.sceneComponent
            ? `no custom scene folder at scenes/${fm.sceneComponent}/`
            : "neither sceneRef nor sceneComponent set";
        errors.push({
          filePath: file.filePath,
          message: `dimension '3d' lesson has ${detail}`,
        });
      }
    }
  }
  return errors;
}

let cache: Lesson[] | null = null;

/** All lessons, validated. Throws on the first invalid file (fail loudly). */
export function listLessons(): Lesson[] {
  if (cache) return cache;
  const lessons: Lesson[] = [];
  for (const file of parseFiles()) {
    const parsed = lessonFrontmatterSchema.safeParse(file.data);
    if (!parsed.success) {
      throw new Error(
        `Invalid lesson frontmatter in ${file.filePath}:\n` +
          parsed.error.issues
            .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
            .join("\n"),
      );
    }
    lessons.push({
      slug: file.slug,
      category: file.category,
      frontmatter: parsed.data,
      body: file.body,
      filePath: file.filePath,
    });
  }
  cache = lessons;
  return lessons;
}

export function getLessonBySlug(
  category: Category,
  slug: string,
): Lesson | undefined {
  return listLessons().find(
    (l) => l.category === category && l.slug === slug,
  );
}

/** Lessons grouped by category, in a stable display order. */
export function listLessonsByCategory(): {
  category: Category;
  lessons: Lesson[];
}[] {
  const all = listLessons();
  return CATEGORIES.map((category) => ({
    category,
    lessons: all.filter((l) => l.category === category),
  })).filter((group) => group.lessons.length > 0);
}

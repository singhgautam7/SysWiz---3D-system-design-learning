import type { Category } from "./schema";

export const CATEGORY_ROUTE: Record<Category, string> = {
  concept: "concepts",
  "system-design": "system-designs",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  concept: "Concepts",
  "system-design": "System Designs",
};

export function lessonHref(category: Category, slug: string): string {
  return `/${CATEGORY_ROUTE[category]}/${slug}`;
}

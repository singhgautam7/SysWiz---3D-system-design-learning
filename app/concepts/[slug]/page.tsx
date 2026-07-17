import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";

import { listLessons, getLessonBySlug } from "@/lib/content/load";
import { loadSceneByRef } from "@/scenes/_engine/loader";
import { SCENE_VARIANTS } from "@/lib/content/scene-variants";
import { SiteHeader } from "@/components/site-header";
import { DimensionBadge, DifficultyPill } from "@/components/badges";
import { mdxComponents } from "@/components/mdx";
import { Scene3DViewport, type SceneVariant } from "@/components/lesson/Scene3DViewport";
import { LessonActions } from "@/components/lesson/LessonActions";
import { InlineNote } from "@/components/lesson/InlineNote";
import { VIZ_REGISTRY } from "@/components/viz/registry";

export function generateStaticParams() {
  return listLessons()
    .filter((l) => l.category === "concept")
    .map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug("concept", slug);
  if (!lesson) return { title: "Lesson not found · SysViz" };
  return {
    title: `${lesson.frontmatter.title} · SysViz`,
    description: lesson.frontmatter.summary,
  };
}

export default async function ConceptLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLessonBySlug("concept", slug);
  if (!lesson) notFound();

  const fm = lesson.frontmatter;
  const { content } = await compileMDX({
    source: lesson.body,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      // Lesson content is first-party and human-reviewed. Our approved component
      // API uses MDX expression props (e.g. <Compare rows={[...]}>, <Step n={1}>),
      // which next-mdx-remote strips by default (blockJS). Allow safe expressions
      // while keeping blockDangerousJS on to reject dangerous calls.
      blockJS: false,
    },
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Breadcrumb + title */}
        <div className="mb-5">
          <Link
            href="/"
            className="font-mono text-[11px] text-muted-fg hover:text-text-2"
          >
            ← Library
          </Link>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <DimensionBadge dimension={fm.dimension} />
                <DifficultyPill difficulty={fm.difficulty} />
                {fm.subcategory && (
                  <span className="font-mono text-[11px] text-muted-fg">
                    {fm.subcategory}
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-[22px] font-bold tracking-tight sm:text-[26px]">
                {fm.title}
              </h1>
            </div>
            <LessonActions slug={lesson.slug} title={fm.title} />
          </div>
        </div>

        {fm.reviewStatus !== "reviewed" && (
          <div className="mb-5 rounded-md border border-[#FFB84D]/30 bg-[#FFB84D]/[0.06] px-3 py-2 font-mono text-[11px] text-[#FFB84D]">
            ⚠ Draft content — pending human accuracy review ({fm.reviewStatus}).
          </div>
        )}

        {/* Desktop: visual/text side-by-side (~60/40). Mobile: stacked. */}
        <div className="lg:grid lg:grid-cols-[60fr_40fr] lg:gap-8">
          <div className="sticky top-14 z-30 mb-6 lg:top-20 lg:mb-0 lg:self-start">
            <LessonVisual lesson={lesson} />
          </div>

          <article className="min-w-0">
            <InlineNote slug={lesson.slug} />
            {content}
          </article>
        </div>
      </main>
    </>
  );
}

function LessonVisual({
  lesson,
}: {
  lesson: NonNullable<ReturnType<typeof getLessonBySlug>>;
}) {
  const fm = lesson.frontmatter;

  if (fm.dimension === "3d") {
    if (fm.sceneRef) {
      const variantConfig = SCENE_VARIANTS[fm.id] ?? [
        { label: fm.title, sceneRef: fm.sceneRef },
      ];
      const variants: SceneVariant[] = variantConfig.map((v) => ({
        label: v.label,
        scene: loadSceneByRef(v.sceneRef),
      }));
      return <Scene3DViewport variants={variants} slug={lesson.slug} />;
    }
    // Escape hatch (sceneComponent) — no custom scenes ship in v1.
    return (
      <div className="grid h-[300px] place-items-center rounded-lg border border-border-2 bg-surface font-mono text-[11px] text-muted-fg md:h-[500px]">
        Custom scene component “{fm.sceneComponent}” not bundled in v1.
      </div>
    );
  }

  const Viz = fm.componentRef ? VIZ_REGISTRY[fm.componentRef] : undefined;
  if (!Viz) {
    throw new Error(
      `2D lesson "${fm.id}" references unknown componentRef "${fm.componentRef}"`,
    );
  }
  return <Viz />;
}

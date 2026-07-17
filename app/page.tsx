import { listLessonSummaries } from "@/lib/content/load";
import { SiteHeader } from "@/components/site-header";
import { LibraryClient } from "@/components/library/LibraryClient";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  const lessons = listLessonSummaries();

  return (
    <>
      <SiteHeader />
      <LibraryClient lessons={lessons} mode="all" />
      <SiteFooter />
    </>
  );
}

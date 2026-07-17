import { listLessonSummaries } from "@/lib/content/load";
import { SiteHeader } from "@/components/site-header";
import { LibraryClient } from "@/components/library/LibraryClient";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Favorites · SysViz" };

export default function FavoritesPage() {
  const lessons = listLessonSummaries();
  return (
    <>
      <SiteHeader />
      <LibraryClient lessons={lessons} mode="favorites" />
      <SiteFooter />
    </>
  );
}

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserBookmarksAction } from "@/app/actions/comic.actions";
import { BookmarkList } from "@/components/bookmarker/BookmarkList";
import styles from "./page.module.css";

export default async function BookmarkerPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const result = await getUserBookmarksAction();

  if ("error" in result) {
    return (
      <div className={styles.dashboardContainer}>
        <p>Something went wrong loading your bookmarks.</p>
      </div>
    );
  }

  const bookmarks = result.data;

  // Serialize dates for client component
  const serializedBookmarks = bookmarks.map((b) => ({
    ...b,
    updatedAt: b.updatedAt,
    comic: {
      ...b.comic,
      chapterLinks: b.comic.chapterLinks.map((cl) => ({
        id: cl.id,
        chapterNum: cl.chapterNum,
        url: cl.url,
      })),
    },
  }));

  return (
    <div className={styles.dashboardContainer}>
      <BookmarkList
        bookmarks={serializedBookmarks}
        userName={session.user.name}
      />
    </div>
  );
}
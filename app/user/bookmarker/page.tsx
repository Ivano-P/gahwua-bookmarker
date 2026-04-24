import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserBookmarksAction } from "@/app/actions/comic.actions";
import { BookOpen, Clock, Coffee, ExternalLink } from "lucide-react";
import styles from "./page.module.css";

function getStatusClass(status: string) {
  switch (status) {
    case "ONGOING":
      return styles.statusOngoing;
    case "COMPLETED":
      return styles.statusCompleted;
    case "HIATUS":
      return styles.statusHiatus;
    case "CANCELLED":
      return styles.statusCancelled;
    default:
      return "";
  }
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>My Comic Bookmarks</h1>
        <p className={styles.dashboardSubtitle}>
          Welcome back, {session.user.name}! Track your reading progress.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No bookmarks yet</h2>
          <p className={styles.emptyDescription}>
            Head over to the Cafe to discover comics and start tracking your
            reading progress.
          </p>
          <Link href="/cafe" className={styles.emptyCta}>
            <Coffee size={16} />
            Browse the Cafe
          </Link>
        </div>
      ) : (
        <div className={styles.bookmarkGrid}>
          {bookmarks.map((bookmark) => (
            <article key={bookmark.id} className={styles.bookmarkCard}>
              <div className={styles.cardTop}>
                <h2 className={styles.comicTitle}>{bookmark.comic.title}</h2>
                <span
                  className={`${styles.statusBadge} ${getStatusClass(bookmark.comic.status)}`}
                >
                  {bookmark.comic.status.toLowerCase()}
                </span>
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.chapterBadge}>
                  Ch. {bookmark.currentChapter}
                </span>
                <span className={styles.metaItem}>
                  <ExternalLink className={styles.metaIcon} />
                  {bookmark.comic._count.chapterLinks} links
                </span>
              </div>

              <div className={styles.cardActions}>
                <Link
                  href={`/cafe/${bookmark.comic.id}`}
                  className={styles.viewBtn}
                >
                  View in Cafe
                </Link>
              </div>

              <span className={styles.lastUpdated}>
                <Clock size={12} /> Updated {formatDate(bookmark.updatedAt)}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
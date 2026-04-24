import Link from "next/link";
import { ComicService } from "@/app/services/comic.service";
import { BookOpen, Link2, Coffee } from "lucide-react";
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

export default async function CafePage() {
  const result = await ComicService.getAllComics();

  if ("error" in result) {
    return (
      <div className={styles.cafeFeed}>
        <p>Something went wrong loading comics.</p>
      </div>
    );
  }

  const comics = result.data;

  return (
    <>
      <section className={styles.cafeHero}>
        <span className={styles.cafeTag}>Community Hub</span>
        <h1 className={styles.cafeTitle}>
          The <span className={styles.cafeTitleAccent}>Cafe</span>
        </h1>
        <p className={styles.cafeSubtitle}>
          Discover comics, share chapter links, and help fellow readers find
          their next great read. Powered by the community.
        </p>
      </section>

      <section className={styles.cafeFeed}>
        <h2 className={styles.feedTitle}>All Comics</h2>

        {comics.length === 0 ? (
          <div className={styles.emptyFeed}>
            <Coffee className={styles.emptyIcon} />
            <p className={styles.emptyText}>
              No comics in the Cafe yet.
            </p>
            <p className={styles.emptySubtext}>
              Check back soon — comics are being added by the community.
            </p>
          </div>
        ) : (
          <div className={styles.comicGrid}>
            {comics.map((comic) => (
              <Link
                key={comic.id}
                href={`/cafe/${comic.id}`}
                className={styles.comicCard}
              >
                <div className={styles.comicCardTop}>
                  <h3 className={styles.comicCardTitle}>{comic.title}</h3>
                  <span
                    className={`${styles.statusBadge} ${getStatusClass(comic.status)}`}
                  >
                    {comic.status.toLowerCase()}
                  </span>
                </div>

                {comic.description && (
                  <p className={styles.comicCardDescription}>
                    {comic.description}
                  </p>
                )}

                <div className={styles.comicCardMeta}>
                  {comic.genres.slice(0, 3).map((genre) => (
                    <span key={genre} className={styles.genreTag}>
                      {genre.toLowerCase().replace("_", " ")}
                    </span>
                  ))}
                  <span className={styles.metaStat}>
                    <Link2 className={styles.metaStatIcon} />
                    {comic._count.chapterLinks}
                  </span>
                  <span className={styles.metaStat}>
                    <BookOpen className={styles.metaStatIcon} />
                    {comic._count.bookmarks}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

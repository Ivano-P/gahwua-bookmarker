"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Link2, Coffee } from "lucide-react";
import styles from "@/app/cafe/page.module.css";

interface ComicData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  genres: string[];
  _count: {
    chapterLinks: number;
    bookmarks: number;
  };
}

interface CafeComicListProps {
  comics: ComicData[];
}

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

export function CafeComicList({ comics }: CafeComicListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = comics.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className={styles.cafeFeed}>
      {/* Toolbar */}
      <div className={styles.feedToolbar}>
        <h2 className={styles.feedTitle}>
          All Comics
          <span className={styles.feedCount}>
            {comics.length}
          </span>
        </h2>
        <div className={styles.feedSearchBox}>
          <Search className={styles.feedSearchIcon} />
          <input
            type="text"
            className={styles.feedSearchInput}
            placeholder="Search comics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      {comics.length === 0 ? (
        <div className={styles.emptyFeed}>
          <Coffee className={styles.emptyIcon} />
          <p className={styles.emptyText}>No comics in the Cafe yet.</p>
          <p className={styles.emptySubtext}>
            Check back soon — comics are being added by the community.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyFeed}>
          <Search className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            No comics match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className={styles.comicGrid}>
          {filtered.map((comic) => (
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
  );
}

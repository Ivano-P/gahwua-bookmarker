import Link from "next/link";
import { ComicService } from "@/app/services/comic.service";
import { checkUserBookmarkAction } from "@/app/actions/comic.actions";
import { AddChapterForm } from "@/components/cafe/AddChapterForm";
import { BookmarkButton } from "@/components/cafe/BookmarkButton";
import {
  ArrowLeft,
  Globe,
  Link2,
  ExternalLink,
  BookOpen,
  Users,
} from "lucide-react";
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

export default async function CafeComicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await ComicService.getComicById(id);

  if ("error" in result) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Comic not found</h1>
        <p className={styles.notFoundText}>
          This comic doesn&apos;t exist or has been removed.
        </p>
        <Link href="/cafe" className={styles.notFoundLink}>
          <ArrowLeft size={14} /> Back to Cafe
        </Link>
      </div>
    );
  }

  const comic = result.data;

  // Check if user has an existing bookmark
  const bookmarkResult = await checkUserBookmarkAction(id);
  const existingChapter =
    "success" in bookmarkResult && bookmarkResult.data
      ? bookmarkResult.data.currentChapter
      : null;

  return (
    <div className={styles.detailContainer}>
      {/* Hero Header */}
      <section className={styles.detailHero}>
        <Link href="/cafe" className={styles.backLink}>
          <ArrowLeft className={styles.backIcon} />
          Back to Cafe
        </Link>

        <div className={styles.heroContent}>
          <h1 className={styles.comicTitle}>{comic.title}</h1>

          <div className={styles.heroMeta}>
            <span
              className={`${styles.statusBadge} ${getStatusClass(comic.status)}`}
            >
              {comic.status.toLowerCase()}
            </span>
            {comic.genres.map((genre) => (
              <span key={genre} className={styles.genreTag}>
                {genre.toLowerCase().replace("_", " ")}
              </span>
            ))}
          </div>

          {comic.description && (
            <p className={styles.comicDescription}>{comic.description}</p>
          )}

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {comic.chapterLinks.length}
              </span>
              <span className={styles.statLabel}>Chapter Links</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {comic._count.bookmarks}
              </span>
              <span className={styles.statLabel}>Readers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{comic.sources.length}</span>
              <span className={styles.statLabel}>Sources</span>
            </div>
          </div>
        </div>
      </section>

      {/* Body Content */}
      <div className={styles.detailBody}>
        {/* Sources */}
        {comic.sources.length > 0 && (
          <div className={styles.sourcesSection}>
            <h2 className={styles.sectionTitle}>
              <Globe className={styles.sectionIcon} />
              Available Sources
            </h2>
            <div className={styles.sourcesList}>
              {comic.sources.map((source) => (
                <span key={source.id} className={styles.sourceChip}>
                  <Link2 className={styles.sourceIcon} />
                  {source.siteName || source.url}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chapter Links */}
        <div className={styles.chaptersSection}>
          <h2 className={styles.sectionTitle}>
            <BookOpen className={styles.sectionIcon} />
            Chapter Links
          </h2>

          {comic.chapterLinks.length === 0 ? (
            <p className={styles.noChapters}>
              No chapter links contributed yet. Be the first!
            </p>
          ) : (
            <div className={styles.chapterList}>
              {comic.chapterLinks.map((chapter) => (
                <div key={chapter.id} className={styles.chapterItem}>
                  <div className={styles.chapterInfo}>
                    <span className={styles.chapterNum}>
                      Chapter {chapter.chapterNum}
                    </span>
                    {chapter.source && (
                      <span className={styles.chapterSource}>
                        via {chapter.source.siteName || "unknown"}
                      </span>
                    )}
                  </div>
                  <a
                    href={chapter.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.chapterLink}
                  >
                    Read
                    <ExternalLink className={styles.linkIcon} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actionsSection}>
          <div className={styles.actionsGrid}>
            <BookmarkButton
              comicId={comic.id}
              existingChapter={existingChapter}
            />
            <AddChapterForm comicId={comic.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

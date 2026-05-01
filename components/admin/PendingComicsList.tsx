"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveComicAction,
  rejectComicAction,
} from "@/app/actions/admin.actions";
import { getLanguageLabel, getLanguageFullName } from "@/lib/language";
import { Check, X, Clock, ExternalLink, BookOpen } from "lucide-react";
import styles from "@/app/admin/pending/page.module.css";

interface ComicSource {
  id: string;
  url: string;
  siteName: string | null;
  language: string;
}

interface PendingComic {
  id: string;
  title: string;
  status: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  sources: ComicSource[];
  submittedBy: { id: string; name: string; username: string | null } | null;
  _count: { chapterLinks: number };
}

interface PendingComicsListProps {
  comics: PendingComic[];
}

function getInitials(title: string): string {
  return title
    .split(" ")
    .filter((w) => w.length > 2 || title.split(" ").length <= 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PendingComicsList({ comics }: PendingComicsListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (comicId: string) => {
    setProcessingId(comicId);
    await approveComicAction(comicId);
    setProcessingId(null);
    router.refresh();
  };

  const handleReject = async (comicId: string) => {
    setProcessingId(comicId);
    await rejectComicAction(comicId);
    setProcessingId(null);
    router.refresh();
  };

  if (comics.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Check className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>No pending comics</h2>
        <p className={styles.emptyDescription}>
          All submissions have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.comicList}>
      {comics.map((comic) => {
        const isProcessing = processingId === comic.id;

        return (
          <div key={comic.id} className={styles.comicCard}>
            {/* Image / Placeholder */}
            <div className={styles.comicImage}>
              {comic.imageUrl ? (
                <img
                  src={comic.imageUrl}
                  alt={comic.title}
                  className={styles.comicImg}
                />
              ) : (
                <div className={styles.comicPlaceholder}>
                  <span className={styles.placeholderInitials}>
                    {getInitials(comic.title)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.comicInfo}>
              <span className={styles.comicTitle}>{comic.title}</span>

              <div className={styles.comicMeta}>
                <span className={styles.statusBadge}>
                  {comic.status.toLowerCase()}
                </span>
                {comic.submittedBy && (
                  <span className={styles.submittedBy}>
                    by {comic.submittedBy.name}
                    {comic.submittedBy.username &&
                      ` @${comic.submittedBy.username}`}
                  </span>
                )}
                <span className={styles.dateLabel}>
                  {new Date(comic.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {comic.description && (
                <p className={styles.comicDescription}>{comic.description}</p>
              )}

              {/* Sources */}
              {comic.sources.length > 0 && (
                <div className={styles.sourcesList}>
                  {comic.sources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.sourceChip}
                    >
                      <span
                        className={styles.langBadge}
                        title={getLanguageFullName(source.language)}
                      >
                        {getLanguageLabel(source.language)}
                      </span>
                      {source.siteName ?? source.url}
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              )}

              {comic._count.chapterLinks > 0 && (
                <span className={styles.chapterCount}>
                  <BookOpen size={11} />
                  {comic._count.chapterLinks} chapter link
                  {comic._count.chapterLinks !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className={styles.cardActions}>
              <button
                className={styles.approveBtn}
                onClick={() => handleApprove(comic.id)}
                disabled={isProcessing}
                title="Approve"
              >
                <Check size={16} />
                <span className={styles.actionText}>Approve</span>
              </button>
              <button
                className={styles.rejectBtn}
                onClick={() => handleReject(comic.id)}
                disabled={isProcessing}
                title="Reject"
              >
                <X size={16} />
                <span className={styles.actionText}>Reject</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

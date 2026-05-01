"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  syncUserBookmarkAction,
  addGlobalChapterLinkAction,
} from "@/app/actions/comic.actions";
import { AddComicModal } from "./AddComicModal";
import {
  Search,
  Plus,
  ExternalLink,
  Pencil,
  Check,
  X,
  Coffee,
  BookOpen,
} from "lucide-react";
import styles from "@/app/user/bookmarker/page.module.css";

interface ChapterLink {
  id: string;
  chapterNum: string;
  url: string;
}

interface BookmarkData {
  id: string;
  currentChapter: string;
  updatedAt: Date;
  comic: {
    id: string;
    title: string;
    status: string;
    imageUrl: string | null;
    chapterLinks: ChapterLink[];
  };
}

interface BookmarkListProps {
  bookmarks: BookmarkData[];
  userName: string;
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

function getReadingUrl(
  chapterLinks: ChapterLink[],
  currentChapter: string
): string | null {
  const match = chapterLinks.find((cl) => cl.chapterNum === currentChapter);
  return match?.url ?? chapterLinks[chapterLinks.length - 1]?.url ?? null;
}

export function BookmarkList({ bookmarks, userName }: BookmarkListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editChapter, setEditChapter] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = bookmarks.filter((b) =>
    b.comic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (bookmark: BookmarkData) => {
    setEditingId(bookmark.id);
    setEditChapter(bookmark.currentChapter);
    setEditUrl("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditChapter("");
    setEditUrl("");
  };

  const saveEdit = async (bookmark: BookmarkData) => {
    if (!editChapter.trim()) return;
    setSaving(true);

    const result = await syncUserBookmarkAction(
      bookmark.comic.id,
      editChapter.trim()
    );

    if (!("error" in result)) {
      // Also add the chapter link if URL provided
      if (editUrl.trim()) {
        await addGlobalChapterLinkAction(
          bookmark.comic.id,
          editChapter.trim(),
          editUrl.trim()
        );
      }
      router.refresh();
    }

    setSaving(false);
    setEditingId(null);
    setEditChapter("");
    setEditUrl("");
  };

  return (
    <>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h1 className={styles.dashboardTitle}>My Bookmarks</h1>
          <span className={styles.bookmarkCount}>
            {bookmarks.length} comic{bookmarks.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search comics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span className={styles.addBtnText}>Add New</span>
          </button>
        </div>
      </div>

      {/* Bookmark List */}
      {filtered.length === 0 && bookmarks.length > 0 ? (
        <div className={styles.emptyState}>
          <Search className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>
            No comics match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No bookmarks yet</h2>
          <p className={styles.emptyDescription}>
            Click &ldquo;Add New&rdquo; above to add a comic and start tracking
            your reading progress.
          </p>
          <button className={styles.emptyCta} onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add Your First Comic
          </button>
        </div>
      ) : (
        <div className={styles.bookmarkList}>
          {filtered.map((bookmark) => {
            const readUrl = getReadingUrl(
              bookmark.comic.chapterLinks,
              bookmark.currentChapter
            );
            const isEditing = editingId === bookmark.id;

            return (
              <div key={bookmark.id} className={styles.bookmarkRow}>
                {/* Comic Image / Placeholder */}
                <div className={styles.comicImage}>
                  {bookmark.comic.imageUrl ? (
                    <img
                      src={bookmark.comic.imageUrl}
                      alt={bookmark.comic.title}
                      className={styles.comicImg}
                    />
                  ) : (
                    <div className={styles.comicPlaceholder}>
                      <span className={styles.placeholderInitials}>
                        {getInitials(bookmark.comic.title)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className={styles.rowInfo}>
                  <div className={styles.rowTitleLine}>
                    <Link
                      href={`/cafe/${bookmark.comic.id}`}
                      className={styles.comicTitle}
                    >
                      {bookmark.comic.title}
                    </Link>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(bookmark.comic.status)}`}
                    >
                      {bookmark.comic.status.toLowerCase()}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className={styles.editRow}>
                      <input
                        type="text"
                        className={styles.editInput}
                        value={editChapter}
                        onChange={(e) => setEditChapter(e.target.value)}
                        placeholder="Chapter #"
                        autoFocus
                      />
                      <input
                        type="url"
                        className={`${styles.editInput} ${styles.editUrlInput}`}
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="Chapter URL (optional)"
                      />
                      <button
                        className={styles.editSaveBtn}
                        onClick={() => saveEdit(bookmark)}
                        disabled={saving}
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        className={styles.editCancelBtn}
                        onClick={cancelEdit}
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.rowMeta}>
                      <span className={styles.chapterBadge}>
                        Ch. {bookmark.currentChapter}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isEditing && (
                  <div className={styles.rowActions}>
                    {readUrl && (
                      <a
                        href={readUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.readBtn}
                        title="Read chapter"
                      >
                        <ExternalLink size={15} />
                        <span className={styles.readBtnText}>Read</span>
                      </a>
                    )}
                    <button
                      className={styles.updateBtn}
                      onClick={() => startEdit(bookmark)}
                      title="Update chapter"
                    >
                      <Pencil size={14} />
                      <span className={styles.updateBtnText}>Update</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comic Modal */}
      {showAddModal && (
        <AddComicModal onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
}

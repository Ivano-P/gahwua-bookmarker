"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createComicAction,
  updateComicAction,
  deleteComicAction,
  addSourceAction,
  deleteSourceAction,
  addChapterAction,
  deleteChapterAction,
} from "@/app/actions/admin.actions";
import { AdminChapterDropdown } from "./AdminChapterDropdown";
import { LANGUAGE_OPTIONS, getLanguageLabel, getLanguageFullName } from "@/lib/language";
import type { Language } from "@prisma/client";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import styles from "@/app/admin/dashboard/page.module.css";

interface ChapterLink {
  id: string;
  chapterNum: string;
  url: string;
  language: string;
  source?: { siteName: string | null } | null;
}

interface ComicSource {
  id: string;
  url: string;
  siteName: string | null;
  language: string;
}

interface ComicData {
  id: string;
  title: string;
  status: string;
  description: string | null;
  imageUrl: string | null;
  sources: ComicSource[];
  chapterLinks: ChapterLink[];
  _count: { bookmarks: number; chapterLinks: number };
}

interface AdminComicsListProps {
  comics: ComicData[];
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
    case "UNKNOWN":
      return styles.statusUnknown;
    default:
      return "";
  }
}

const STATUS_OPTIONS = ["UNKNOWN", "ONGOING", "COMPLETED", "HIATUS", "CANCELLED"];

export function AdminComicsList({ comics }: AdminComicsListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Inline edit state
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");

  // Add source form state
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceLang, setNewSourceLang] = useState<Language>("EN");

  // Add chapter form state
  const [newChapterNum, setNewChapterNum] = useState("");
  const [newChapterUrl, setNewChapterUrl] = useState("");
  const [newChapterLang, setNewChapterLang] = useState<Language>("EN");

  // Create form state
  const [createTitle, setCreateTitle] = useState("");
  const [createStatus, setCreateStatus] = useState("UNKNOWN");
  const [createDescription, setCreateDescription] = useState("");
  const [createImageUrl, setCreateImageUrl] = useState("");
  const [createSourceUrl, setCreateSourceUrl] = useState("");
  const [createSourceLang, setCreateSourceLang] = useState<Language>("EN");
  const [createError, setCreateError] = useState("");

  const filtered = comics.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ── Create Comic ──────────────────────────
  const handleCreate = async () => {
    if (!createTitle.trim()) {
      setCreateError("Title is required.");
      return;
    }
    setSaving(true);
    setCreateError("");
    const result = await createComicAction({
      title: createTitle.trim(),
      status: createStatus,
      description: createDescription.trim() || undefined,
      imageUrl: createImageUrl.trim() || undefined,
      sourceUrl: createSourceUrl.trim() || undefined,
      sourceLanguage: createSourceUrl.trim() ? createSourceLang : undefined,
    });
    if ("error" in result) {
      setCreateError(result.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }
    setShowCreateModal(false);
    setCreateTitle("");
    setCreateStatus("UNKNOWN");
    setCreateDescription("");
    setCreateImageUrl("");
    setCreateSourceUrl("");
    setCreateSourceLang("EN");
    setSaving(false);
    router.refresh();
  };

  // ── Update Status ─────────────────────────
  const handleStatusSave = async (comicId: string) => {
    setSaving(true);
    await updateComicAction(comicId, { status: editStatus });
    setEditingStatusId(null);
    setSaving(false);
    router.refresh();
  };

  // ── Delete Comic ──────────────────────────
  const handleDelete = async (comicId: string) => {
    setSaving(true);
    await deleteComicAction(comicId);
    setDeleteConfirm(null);
    setSaving(false);
    router.refresh();
  };

  // ── Add Source ────────────────────────────
  const handleAddSource = async (comicId: string) => {
    if (!newSourceUrl.trim()) return;
    setSaving(true);
    await addSourceAction(comicId, newSourceUrl.trim(), undefined, newSourceLang);
    setNewSourceUrl("");
    setNewSourceLang("EN");
    setSaving(false);
    router.refresh();
  };

  // ── Delete Source ─────────────────────────
  const handleDeleteSource = async (sourceId: string) => {
    setSaving(true);
    await deleteSourceAction(sourceId);
    setSaving(false);
    router.refresh();
  };

  // ── Add Chapter ───────────────────────────
  const handleAddChapter = async (comicId: string) => {
    if (!newChapterNum.trim() || !newChapterUrl.trim()) return;
    setSaving(true);
    await addChapterAction(comicId, newChapterNum.trim(), newChapterUrl.trim(), newChapterLang);
    setNewChapterNum("");
    setNewChapterUrl("");
    setNewChapterLang("EN");
    setSaving(false);
    router.refresh();
  };

  // ── Delete Chapter ────────────────────────
  const handleDeleteChapter = async (linkId: string) => {
    setSaving(true);
    await deleteChapterAction(linkId);
    setSaving(false);
    router.refresh();
  };

  return (
    <>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h1 className={styles.dashboardTitle}>Comics</h1>
          <span className={styles.comicCount}>
            {comics.length} comic{comics.length !== 1 ? "s" : ""}
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
          <button
            className={styles.addBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            <span className={styles.addBtnText}>New Comic</span>
          </button>
        </div>
      </div>

      {/* Comics List */}
      {filtered.length === 0 && comics.length > 0 ? (
        <div className={styles.emptyState}>
          <Search className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>
            No comics match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : comics.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No comics yet</h2>
          <p className={styles.emptyDescription}>
            Create your first comic to start managing the catalog.
          </p>
        </div>
      ) : (
        <div className={styles.comicList}>
          {filtered.map((comic) => {
            const isExpanded = expandedId === comic.id;
            const isEditingStatus = editingStatusId === comic.id;

            return (
              <div key={comic.id}>
                {/* Summary Row */}
                <div
                  className={styles.comicRow}
                  onClick={() => toggleExpand(comic.id)}
                >
                  {/* Image */}
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
                  <div className={styles.rowInfo}>
                    <div className={styles.rowTitleLine}>
                      <span className={styles.comicTitle}>{comic.title}</span>
                      <span
                        className={`${styles.statusBadge} ${getStatusClass(comic.status)}`}
                      >
                        {comic.status.toLowerCase()}
                      </span>
                    </div>
                    <div className={styles.rowMeta}>
                      <span className={styles.metaItem}>
                        <LinkIcon size={11} />
                        {comic.sources.length} source{comic.sources.length !== 1 ? "s" : ""}
                      </span>
                      <span className={styles.metaItem}>
                        <BookOpen size={11} />
                        {comic._count.chapterLinks} ch.
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className={styles.rowActions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={styles.editBtn}
                      onClick={() => {
                        setEditingStatusId(comic.id);
                        setEditStatus(comic.status);
                      }}
                      title="Edit status"
                    >
                      <Pencil size={13} />
                      <span className={styles.btnText}>Edit</span>
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteConfirm(comic.id)}
                      title="Delete comic"
                    >
                      <Trash2 size={13} />
                      <span className={styles.btnText}>Delete</span>
                    </button>
                    {isExpanded ? (
                      <ChevronUp size={16} style={{ opacity: 0.4 }} />
                    ) : (
                      <ChevronDown size={16} style={{ opacity: 0.4 }} />
                    )}
                  </div>
                </div>

                {/* Inline Status Edit */}
                {isEditingStatus && (
                  <div
                    className={styles.expandedPanel}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.inlineEditRow}>
                      <span className={styles.detailLabel} style={{ marginBottom: 0 }}>
                        Status:
                      </span>
                      <select
                        className={styles.inlineSelect}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        className={styles.inlineSaveBtn}
                        onClick={() => handleStatusSave(comic.id)}
                        disabled={saving}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        className={styles.inlineCancelBtn}
                        onClick={() => setEditingStatusId(null)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className={styles.expandedPanel}>
                    {/* Sources */}
                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel}>Sources</div>
                      <div className={styles.detailList}>
                        {comic.sources.map((source) => (
                          <div key={source.id} className={styles.detailItem}>
                            <span
                              className={styles.langBadge}
                              title={getLanguageFullName(source.language)}
                            >
                              {getLanguageLabel(source.language)}
                            </span>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.detailItemLink}
                            >
                              {source.siteName ?? source.url}
                              <ExternalLink
                                size={11}
                                style={{ marginLeft: "0.3rem", verticalAlign: "middle" }}
                              />
                            </a>
                            <button
                              className={styles.removeBtn}
                              onClick={() => handleDeleteSource(source.id)}
                              title="Remove source"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className={styles.addRow}>
                        <select
                          className={styles.addLangSelect}
                          value={newSourceLang}
                          onChange={(e) => setNewSourceLang(e.target.value as Language)}
                        >
                          {LANGUAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="url"
                          className={styles.addInput}
                          placeholder="Add source URL..."
                          value={newSourceUrl}
                          onChange={(e) => setNewSourceUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddSource(comic.id);
                          }}
                        />
                        <button
                          className={styles.addSubmitBtn}
                          onClick={() => handleAddSource(comic.id)}
                          disabled={saving || !newSourceUrl.trim()}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Chapter Links */}
                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel}>
                        Chapters ({comic.chapterLinks.length})
                      </div>
                      <div className={styles.detailList}>
                        {(() => {
                          const grouped = comic.chapterLinks.reduce((acc, ch) => {
                            if (!acc[ch.chapterNum]) acc[ch.chapterNum] = [];
                            acc[ch.chapterNum].push(ch);
                            return acc;
                          }, {} as Record<string, typeof comic.chapterLinks>);
                          
                          const sortedNums = Object.keys(grouped).sort((a, b) => {
                            const numA = parseFloat(a);
                            const numB = parseFloat(b);
                            if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
                            return b.localeCompare(a);
                          });

                          return sortedNums.map((chapterNum) => (
                            <AdminChapterDropdown
                              key={chapterNum}
                              chapterNum={chapterNum}
                              links={grouped[chapterNum]}
                              onDelete={handleDeleteChapter}
                            />
                          ));
                        })()}
                      </div>
                      <div className={styles.addRow}>
                        <select
                          className={styles.addLangSelect}
                          value={newChapterLang}
                          onChange={(e) => setNewChapterLang(e.target.value as Language)}
                        >
                          {LANGUAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className={`${styles.addInput} ${styles.addInputSmall}`}
                          placeholder="Ch. #"
                          value={newChapterNum}
                          onChange={(e) => setNewChapterNum(e.target.value)}
                        />
                        <input
                          type="url"
                          className={styles.addInput}
                          placeholder="Chapter URL..."
                          value={newChapterUrl}
                          onChange={(e) => setNewChapterUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddChapter(comic.id);
                          }}
                        />
                        <button
                          className={styles.addSubmitBtn}
                          onClick={() => handleAddChapter(comic.id)}
                          disabled={
                            saving ||
                            !newChapterNum.trim() ||
                            !newChapterUrl.trim()
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Comic Modal */}
      {showCreateModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCreateModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>New Comic</h2>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Title *</label>
              <input
                type="text"
                className={styles.formInput}
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="Comic title"
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select
                className={styles.formSelect}
                value={createStatus}
                onChange={(e) => setCreateStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                className={styles.formTextarea}
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Image URL</label>
              <input
                type="url"
                className={styles.formInput}
                value={createImageUrl}
                onChange={(e) => setCreateImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Source URL</label>
              <div className={styles.addRow} style={{ marginTop: "0.25rem" }}>
                <select
                  className={styles.addLangSelect}
                  value={createSourceLang}
                  onChange={(e) => setCreateSourceLang(e.target.value as Language)}
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  className={styles.addInput}
                  value={createSourceUrl}
                  onChange={(e) => setCreateSourceUrl(e.target.value)}
                  placeholder="https://mangasite.com"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {createError && (
              <p className={styles.errorText}>{createError}</p>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.modalSubmitBtn}
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className={styles.confirmOverlay}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className={styles.confirmBox}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.confirmTitle}>Delete Comic?</h3>
            <p className={styles.confirmText}>
              This will permanently remove this comic and all its sources,
              chapters, and bookmarks.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteBtn}
                onClick={() => handleDelete(deleteConfirm)}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

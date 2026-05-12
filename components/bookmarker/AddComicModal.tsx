"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  searchComicsAction,
  addComicFromBookmarkerAction,
  addAltTitlesAction,
} from "@/app/actions/comic.actions";
import { LANGUAGE_OPTIONS } from "@/lib/language";
import type { Language } from "@prisma/client";
import { X, Search, BookOpen, Plus, Check, ArrowLeft } from "lucide-react";
import styles from "./AddComicModal.module.css";

interface SearchResult {
  id: string;
  title: string;
  imageUrl: string | null;
  status: string;
  altTitles: string[];
}

interface AddComicModalProps {
  onClose: () => void;
}

const STATUS_OPTIONS = ["UNKNOWN", "ONGOING", "COMPLETED", "HIATUS", "CANCELLED"];

export function AddComicModal({ onClose }: AddComicModalProps) {
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected existing comic
  const [selectedComic, setSelectedComic] = useState<SearchResult | null>(null);

  // New comic form state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [title, setTitle] = useState("");
  const [altTitlesInput, setAltTitlesInput] = useState("");
  const [status, setStatus] = useState("UNKNOWN");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceLang, setSourceLang] = useState<Language>("EN");

  // Bookmark fields (shared by both modes)
  const [chapterNum, setChapterNum] = useState("");
  const [chapterUrl, setChapterUrl] = useState("");
  const [chapterLang, setChapterLang] = useState<Language>("EN");

  // Alt title for existing comic
  const [newAltTitle, setNewAltTitle] = useState("");

  // Submit state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    const result = await searchComicsAction(query);
    if ("success" in result && result.data) {
      setSearchResults(result.data);
    }
    setSearching(false);
    setHasSearched(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2 && !selectedComic && !isCreatingNew) {
        performSearch(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedComic, isCreatingNew, performSearch]);

  // Select existing comic from search
  const handleSelectComic = (comic: SearchResult) => {
    setSelectedComic(comic);
    setSearchResults([]);
    setSearchQuery(comic.title);
  };

  // Switch to "create new" mode
  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedComic(null);
    setTitle(searchQuery);
    setSearchResults([]);
  };

  // Go back to search
  const handleBackToSearch = () => {
    setIsCreatingNew(false);
    setSelectedComic(null);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setNewAltTitle("");
    setError("");
  };

  // Submit
  const handleSubmit = async () => {
    setSaving(true);
    setError("");

    const data: Parameters<typeof addComicFromBookmarkerAction>[0] = {};

    if (selectedComic) {
      // Mode 1: Bookmark existing comic
      data.existingComicId = selectedComic.id;
      data.chapterNum = chapterNum.trim() || "1";
      if (chapterUrl.trim()) {
        data.chapterUrl = chapterUrl.trim();
        data.chapterLanguage = chapterLang;
      }
    } else if (isCreatingNew) {
      // Mode 2: Create new comic
      if (!title.trim()) {
        setError("Title is required.");
        setSaving(false);
        return;
      }
      data.title = title.trim();
      data.altTitles = altTitlesInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      data.status = status;
      data.description = description.trim() || undefined;
      data.imageUrl = imageUrl.trim() || undefined;
      data.sourceUrl = sourceUrl.trim() || undefined;
      data.sourceLanguage = sourceUrl.trim() ? sourceLang : undefined;
      data.chapterNum = chapterNum.trim() || undefined;
      if (chapterUrl.trim()) {
        data.chapterUrl = chapterUrl.trim();
        data.chapterLanguage = chapterLang;
      }
    } else {
      setError("Select an existing comic or create a new one.");
      setSaving(false);
      return;
    }

    const result = await addComicFromBookmarkerAction(data);

    if ("error" in result) {
      setError(result.error ?? "Something went wrong.");
    } else {
      // If bookmarking existing comic and user added an alt title, save it
      if (selectedComic && newAltTitle.trim()) {
        await addAltTitlesAction(selectedComic.id, [newAltTitle.trim()]);
      }

      setSuccessMessage(
        selectedComic
          ? "Comic bookmarked!"
          : "Comic created and bookmarked!"
      );
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 800);
    }

    setSaving(false);
  };

  // Show success state
  if (successMessage) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.successState}>
            <Check size={36} className={styles.successIcon} />
            <p className={styles.successText}>{successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          {(selectedComic || isCreatingNew) && (
            <button
              className={styles.backBtn}
              onClick={handleBackToSearch}
              title="Back to search"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h2 className={styles.modalTitle}>
            {selectedComic
              ? "Bookmark Comic"
              : isCreatingNew
              ? "New Comic"
              : "Add Comic"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Search Mode */}
        {!selectedComic && !isCreatingNew && (
          <>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search existing comics by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Search Results */}
            {searching && (
              <p className={styles.searchHint}>Searching...</p>
            )}
            {searchResults.length > 0 && (
              <div className={styles.resultsList}>
                {searchResults.map((comic) => (
                  <button
                    key={comic.id}
                    className={styles.resultItem}
                    onClick={() => handleSelectComic(comic)}
                  >
                    <div className={styles.resultImage}>
                      {comic.imageUrl ? (
                        <img
                          src={comic.imageUrl}
                          alt={comic.title}
                          className={styles.resultImg}
                        />
                      ) : (
                        <BookOpen size={16} className={styles.resultPlaceholder} />
                      )}
                    </div>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultTitle}>{comic.title}</span>
                      {comic.altTitles && comic.altTitles.length > 0 && (
                        <span className={styles.resultAltTitles}>
                          aka: {comic.altTitles.slice(0, 2).join(", ")}
                          {comic.altTitles.length > 2 && "…"}
                        </span>
                      )}
                    </div>
                    <span className={styles.resultStatus}>
                      {comic.status.toLowerCase()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No results hint */}
            {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
              <p className={styles.searchHint}>
                No comics found matching &ldquo;{searchQuery}&rdquo;
              </p>
            )}

            {/* Create new — only shown after user has searched */}
            {hasSearched && searchQuery.trim().length >= 2 && (
              <button className={styles.createNewBtn} onClick={handleCreateNew}>
                <Plus size={15} />
                Create a new comic{searchQuery.trim() ? `: "${searchQuery.trim()}"` : ""}
              </button>
            )}
          </>
        )}

        {/* Selected Existing Comic */}
        {selectedComic && (
          <>
            <div className={styles.selectedComic}>
              <div className={styles.selectedImage}>
                {selectedComic.imageUrl ? (
                  <img
                    src={selectedComic.imageUrl}
                    alt={selectedComic.title}
                    className={styles.selectedImg}
                  />
                ) : (
                  <BookOpen size={24} className={styles.resultPlaceholder} />
                )}
              </div>
              <div className={styles.selectedInfo}>
                <span className={styles.selectedTitle}>{selectedComic.title}</span>
                <span className={styles.selectedStatus}>
                  {selectedComic.status.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Alt title contribution for existing comic */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Know another name?</label>
              <input
                type="text"
                className={styles.formInput}
                value={newAltTitle}
                onChange={(e) => setNewAltTitle(e.target.value)}
                placeholder="Alternative title (optional)"
              />
            </div>
          </>
        )}

        {/* Create New Comic Fields */}
        {isCreatingNew && (
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Title *</label>
              <input
                type="text"
                className={styles.formInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Comic title"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Alt Titles</label>
              <input
                type="text"
                className={styles.formInput}
                value={altTitlesInput}
                onChange={(e) => setAltTitlesInput(e.target.value)}
                placeholder="Comma-separated alternative names"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select
                className={styles.formSelect}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                className={styles.formTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Image URL</label>
              <input
                type="url"
                className={styles.formInput}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Source URL</label>
              <div className={styles.inlineRow}>
                <select
                  className={styles.langSelect}
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value as Language)}
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="url"
                  className={styles.formInput}
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://mangasite.com"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Chapter / Bookmark fields (shown for both modes) */}
        {(selectedComic || isCreatingNew) && (
          <div className={styles.bookmarkFields}>
            <div className={styles.sectionLabel}>Your Bookmark</div>
            <div className={styles.inlineRow}>
              <select
                className={styles.langSelect}
                value={chapterLang}
                onChange={(e) => setChapterLang(e.target.value as Language)}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                className={styles.formInput}
                value={chapterNum}
                onChange={(e) => setChapterNum(e.target.value)}
                placeholder="Ch. #"
                style={{ width: "70px", flex: "none" }}
              />
              <input
                type="url"
                className={styles.formInput}
                value={chapterUrl}
                onChange={(e) => setChapterUrl(e.target.value)}
                placeholder="Chapter URL (optional)"
                style={{ flex: 1 }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className={styles.errorText}>{error}</p>}

        {/* Actions */}
        {(selectedComic || isCreatingNew) && (
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : selectedComic
                ? "Bookmark"
                : "Create & Bookmark"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

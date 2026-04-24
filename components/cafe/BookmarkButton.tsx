"use client";

import { useState } from "react";
import { syncUserBookmarkAction } from "@/app/actions/comic.actions";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import styles from "./BookmarkButton.module.css";

interface BookmarkButtonProps {
  comicId: string;
  existingChapter?: string | null;
}

export function BookmarkButton({
  comicId,
  existingChapter,
}: BookmarkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [chapter, setChapter] = useState(existingChapter ?? "");
  const [bookmarked, setBookmarked] = useState(!!existingChapter);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleBookmark = async () => {
    setLoading(true);
    setMessage(null);

    const chapterToSave = chapter.trim() || "1";
    const result = await syncUserBookmarkAction(comicId, chapterToSave);

    if ("error" in result) {
      setMessage({ type: "error", text: result.error ?? "Something went wrong." });
    } else {
      setBookmarked(true);
      setMessage({
        type: "success",
        text: bookmarked
          ? "Bookmark updated!"
          : "Added to your bookmarks!",
      });
    }

    setLoading(false);
  };

  return (
    <div className={styles.bookmarkBtnContainer}>
      {bookmarked && (
        <span className={styles.bookmarkedInfo}>
          Currently at Ch. {existingChapter || chapter || "1"}
        </span>
      )}
      <button
        className={`${styles.bookmarkBtn} ${bookmarked ? styles.updateBtn : styles.addBtn}`}
        onClick={handleBookmark}
        disabled={loading}
      >
        {bookmarked ? (
          <BookmarkCheck className={styles.btnIcon} />
        ) : (
          <BookmarkPlus className={styles.btnIcon} />
        )}
        {loading
          ? "Saving..."
          : bookmarked
            ? "Update Bookmark"
            : "Add to My Bookmarks"}
      </button>
      {message && (
        <p
          className={
            message.type === "success" ? styles.successMsg : styles.errorMsg
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

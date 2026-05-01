"use client";

import { useState } from "react";
import { addGlobalChapterLinkAction } from "@/app/actions/comic.actions";
import { LANGUAGE_OPTIONS } from "@/lib/language";
import type { Language } from "@prisma/client";
import { Send } from "lucide-react";
import styles from "./AddChapterForm.module.css";

interface AddChapterFormProps {
  comicId: string;
}

export function AddChapterForm({ comicId }: AddChapterFormProps) {
  const [chapterNum, setChapterNum] = useState("");
  const [chapterUrl, setChapterUrl] = useState("");
  const [language, setLanguage] = useState<Language>("EN");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await addGlobalChapterLinkAction(
      comicId,
      chapterNum.trim(),
      chapterUrl.trim(),
      language
    );

    if ("error" in result) {
      setMessage({ type: "error", text: result.error ?? "Something went wrong." });
    } else {
      setMessage({ type: "success", text: "Chapter link added!" });
      setChapterNum("");
      setChapterUrl("");
      setLanguage("EN");
    }

    setLoading(false);
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>Contribute a Chapter Link</h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <select
            className={styles.languageSelect}
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            className={`${styles.input} ${styles.chapterInput}`}
            placeholder="Ch. #"
            value={chapterNum}
            onChange={(e) => setChapterNum(e.target.value)}
            required
          />
          <input
            type="url"
            className={styles.input}
            placeholder="https://example.com/manga/chapter-1"
            value={chapterUrl}
            onChange={(e) => setChapterUrl(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          <Send className={styles.submitIcon} />
          {loading ? "Submitting..." : "Add Link"}
        </button>
      </form>
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

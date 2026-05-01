"use client";

import { useState } from "react";
import { ExternalLink, X, ChevronDown, ChevronUp } from "lucide-react";
import { getLanguageLabel, getLanguageFullName } from "@/lib/language";
import styles from "@/app/admin/dashboard/page.module.css";
import dropdownStyles from "../cafe/ChapterDropdown.module.css"; // Reuse styling for group container

interface ChapterLink {
  id: string;
  chapterNum: string;
  url: string;
  language: string;
  source?: { siteName: string | null } | null;
}

interface AdminChapterDropdownProps {
  chapterNum: string;
  links: ChapterLink[];
  onDelete: (id: string) => void;
}

export function AdminChapterDropdown({ chapterNum, links, onDelete }: AdminChapterDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={dropdownStyles.chapterGroup} style={{ marginBottom: "0.5rem" }}>
      <button 
        className={dropdownStyles.chapterHeader} 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ padding: "0.5rem 0.75rem" }}
      >
        <span className={dropdownStyles.chapterNum} style={{ fontSize: "0.85rem" }}>Ch. {chapterNum}</span>
        <div className={dropdownStyles.chapterHeaderRight}>
          <span className={dropdownStyles.chapterSourceCount}>
            {links.length} link{links.length !== 1 ? "s" : ""}
          </span>
          {isExpanded ? (
            <ChevronUp className={dropdownStyles.chevronIcon} />
          ) : (
            <ChevronDown className={dropdownStyles.chevronIcon} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className={dropdownStyles.chapterLinksList} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0.5rem" }}>
          {links.map((ch) => (
            <div key={ch.id} className={styles.detailItem} style={{ border: "none", padding: "0.25rem 0.5rem", background: "white", borderRadius: "6px" }}>
              <span
                className={styles.langBadge}
                title={getLanguageFullName(ch.language)}
              >
                {getLanguageLabel(ch.language)}
              </span>
              <span className={styles.detailItemText} style={{ minWidth: "40px" }}>
                Ch. {ch.chapterNum}
              </span>
              <a
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.detailItemLink}
                style={{ textAlign: "right", flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
              >
                {ch.source?.siteName ?? "link"}
                <ExternalLink
                  size={11}
                  style={{ marginLeft: "0.3rem", verticalAlign: "middle" }}
                />
              </a>
              <button
                className={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(ch.id);
                }}
                title="Remove chapter link"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import styles from "./ChapterDropdown.module.css";

interface ChapterLink {
  id: string;
  chapterNum: string;
  url: string;
  source?: { siteName: string | null } | null;
}

interface ChapterDropdownProps {
  chapterNum: string;
  links: ChapterLink[];
}

export function ChapterDropdown({ chapterNum, links }: ChapterDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If there's only 1 link, we could optionally make the whole header clickable to the link,
  // but to keep it consistent, we'll keep the dropdown behavior or just show it directly.
  // We'll use the dropdown behavior for all to maintain a consistent UI, 
  // or we can auto-expand if there's only 1.
  
  return (
    <div className={styles.chapterGroup}>
      <button 
        className={styles.chapterHeader} 
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={styles.chapterNum}>Chapter {chapterNum}</span>
        <div className={styles.chapterHeaderRight}>
          <span className={styles.chapterSourceCount}>
            {links.length} source{links.length !== 1 ? "s" : ""}
          </span>
          {isExpanded ? (
            <ChevronUp className={styles.chevronIcon} />
          ) : (
            <ChevronDown className={styles.chevronIcon} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className={styles.chapterLinksList}>
          {links.map((link) => (
            <div key={link.id} className={styles.chapterLinkRow}>
              <span className={styles.chapterSource}>
                via {link.source?.siteName || "unknown"}
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chapterLinkBtn}
              >
                Read
                <ExternalLink className={styles.linkIcon} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

# 📖 Gawaua Comic Bookmarker

A modern, crowdsourced bookmarking platform and Chrome Extension for tracking reading progress across various manga, manhwa, and manhua web sources.

## 🎯 The Problem
Reading comics across different free scanlation sites creates a fragmented experience. Sites often miss chapters, forcing readers to jump between different domains. Keeping track of exactly which chapter (e.g., Chapter 45.5) you left off on, and on which site, becomes a manual and frustrating task.

## 💡 The Solution
Gawaua is a hybrid Web App and Chrome Extension that tracks exactly where you are in a comic, regardless of the site you are reading on. 
By leveraging a crowdsourced database, when a user adds a new source URL for a specific comic, it becomes available to the rest of the community, creating a unified directory of where to read specific chapters.

---

## 🏗️ Architecture & Tech Stack

This project is currently in **V1 (Lean MVP)**, utilizing a Full-Stack TypeScript architecture to optimize for development velocity and deployment efficiency.

### V1 Tech Stack (Current)
* **Frontend & API:** Next.js 16 (App Router, React Server Components, Route Handlers)
* **Browser Extension:** Vite, React, Tailwind CSS, shadcn/ui, Manifest V3 (`@crxjs/vite-plugin`)
* **Authentication:** Better Auth (Decoupled JWT/Session management)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Deployment:** Dokploy (VPS)

### V2 Roadmap (Future)
* **Background Workers:** C# .NET 9+ background services.
* **Web Scraping:** Automated crawling (Playwright/HtmlAgilityPack) to automatically find and verify new comic sources and chapters to enrich the Next.js database.

---

## 🗄️ Core Database Model (The "Manga Name" Strategy)

To solve the issue of inconsistent naming across different sites (e.g., "Solo Leveling" vs "Only I Level Up"), the database strictly separates the canonical comic from its crowdsourced URLs:

1.  **`Comic`**: Stores the canonical entity (`primaryTitle`, `altTitles`).
2.  **`ComicSource`**: Stores the actual URLs where the comic lives (`domain`, `url`). Links back to `Comic`.
3.  **`UserBookmark`**: Links a `User` to a specific `ComicSource` and tracks their `currentChapter` (stored as a Float to support half-chapters).

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v20+)
* PostgreSQL running locally or via Docker
* npm or pnpm

### 1. Web Application (Next.js)
Navigate to the root directory (or your Next.js folder) to set up the web dashboard and API.
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
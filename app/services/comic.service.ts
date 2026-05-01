import { prisma } from "@/lib/prisma";
import type { Language } from "@prisma/client";

/**
 * ComicService — Pure service layer for all comic-related DB operations.
 * No auth checks here; those belong in the actions layer.
 */
export class ComicService {
  /**
   * Fetch all comics for the Cafe discovery feed.
   */
  static async getAllComics() {
    try {
      const comics = await prisma.comic.findMany({
        where: { approvalStatus: "APPROVED" },
        include: {
          sources: true,
          _count: { select: { chapterLinks: true, bookmarks: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
      return { success: true as const, data: comics };
    } catch (error) {
      console.error("[ComicService.getAllComics]", error);
      return { error: "Failed to fetch comics." };
    }
  }

  /**
   * Fetch a specific comic with all its relations.
   */
  static async getComicById(comicId: string) {
    try {
      const comic = await prisma.comic.findUnique({
        where: { id: comicId },
        include: {
          sources: true,
          chapterLinks: {
            orderBy: { chapterNum: "asc" },
            include: { source: true },
          },
          _count: { select: { bookmarks: true } },
        },
      });

      if (!comic || comic.approvalStatus !== "APPROVED") {
        return { error: "Comic not found." };
      }

      return { success: true as const, data: comic };
    } catch (error) {
      console.error("[ComicService.getComicById]", error);
      return { error: "Failed to fetch comic details." };
    }
  }

  /**
   * Upsert a user's private bookmark to track reading progress.
   */
  static async upsertBookmark(
    userId: string,
    comicId: string,
    chapterNum: string
  ) {
    try {
      const bookmark = await prisma.bookmark.upsert({
        where: {
          userId_comicId: { userId, comicId },
        },
        update: { currentChapter: chapterNum },
        create: { userId, comicId, currentChapter: chapterNum },
      });
      return { success: true as const, data: bookmark };
    } catch (error) {
      console.error("[ComicService.upsertBookmark]", error);
      return { error: "Failed to update bookmark." };
    }
  }

  /**
   * Fetch all bookmarks for a given user, with comic data included.
   */
  static async getUserBookmarks(userId: string) {
    try {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId },
        include: {
          comic: {
            include: {
              sources: true,
              chapterLinks: {
                orderBy: { chapterNum: "asc" },
              },
              _count: { select: { chapterLinks: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
      return { success: true as const, data: bookmarks };
    } catch (error) {
      console.error("[ComicService.getUserBookmarks]", error);
      return { error: "Failed to fetch bookmarks." };
    }
  }

  /**
   * Add a chapter link to the global pool.
   * Automatically extracts the site origin and upserts the ComicSource
   * (with duplicate check via the @@unique constraint).
   */
  static async addChapterLink(
    comicId: string,
    chapterNum: string,
    chapterUrl: string,
    language: Language = "EN"
  ) {
    try {
      // Extract site origin from the chapter URL
      const parsedUrl = new URL(chapterUrl);
      const siteOrigin = parsedUrl.origin; // e.g. "https://www.mangakakalot.gg"
      const siteName = parsedUrl.hostname.replace(/^www\./, ""); // e.g. "mangakakalot.gg"

      // Upsert the ComicSource (duplicate-safe via @@unique([comicId, url]))
      const source = await prisma.comicSource.upsert({
        where: {
          comicId_url: { comicId, url: siteOrigin },
        },
        update: {}, // No update needed if it already exists
        create: {
          comicId,
          url: siteOrigin,
          siteName,
          language,
        },
      });

      // Upsert the ChapterLink (duplicate-safe via @@unique([comicId, chapterNum, url, language]))
      const chapterLink = await prisma.chapterLink.upsert({
        where: {
          comicId_chapterNum_url_language: { comicId, chapterNum, url: chapterUrl, language },
        },
        update: {}, // No update needed if it already exists
        create: {
          comicId,
          sourceId: source.id,
          chapterNum,
          url: chapterUrl,
          language,
        },
      });

      return { success: true as const, data: chapterLink };
    } catch (error) {
      console.error("[ComicService.addChapterLink]", error);
      return { error: "Failed to add chapter link." };
    }
  }

  /**
   * Check if a user already has a bookmark for a specific comic.
   */
  static async getUserBookmarkForComic(userId: string, comicId: string) {
    try {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_comicId: { userId, comicId },
        },
      });
      return { success: true as const, data: bookmark };
    } catch (error) {
      console.error("[ComicService.getUserBookmarkForComic]", error);
      return { error: "Failed to check bookmark status." };
    }
  }

  /**
   * Search comics by title (case-insensitive) for autocomplete.
   * Only returns APPROVED comics.
   */
  static async searchComicsByTitle(query: string) {
    try {
      const comics = await prisma.comic.findMany({
        where: {
          approvalStatus: "APPROVED",
          title: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          status: true,
        },
        take: 8,
        orderBy: { title: "asc" },
      });
      return { success: true as const, data: comics };
    } catch (error) {
      console.error("[ComicService.searchComicsByTitle]", error);
      return { error: "Failed to search comics." };
    }
  }

  /**
   * Create a comic from the bookmarker flow.
   * If user is trusted, comic is APPROVED immediately.
   * Otherwise, comic is PENDING admin review.
   * Also creates a bookmark and optionally a chapter link + source.
   */
  static async createComicFromUser(data: {
    title: string;
    status?: string;
    description?: string;
    imageUrl?: string;
    sourceUrl?: string;
    sourceLanguage?: string;
    chapterNum?: string;
    chapterUrl?: string;
    chapterLanguage?: string;
    userId: string;
    isTrusted: boolean;
  }) {
    try {
      // Create the comic
      const comic = await prisma.comic.create({
        data: {
          title: data.title,
          status: (data.status as "ONGOING" | "COMPLETED" | "HIATUS" | "CANCELLED") ?? "ONGOING",
          description: data.description ?? null,
          imageUrl: data.imageUrl ?? null,
          approvalStatus: data.isTrusted ? "APPROVED" : "PENDING",
          submittedById: data.userId,
        },
      });

      // Create source if provided
      let sourceId: string | null = null;
      if (data.sourceUrl?.trim()) {
        try {
          const parsedUrl = new URL(data.sourceUrl);
          const siteName = parsedUrl.hostname.replace(/^www\./, "");
          const source = await prisma.comicSource.create({
            data: {
              comicId: comic.id,
              url: data.sourceUrl,
              siteName,
              language: (data.sourceLanguage as Language) ?? "EN",
            },
          });
          sourceId = source.id;
        } catch {
          console.warn("[ComicService.createComicFromUser] Source creation failed.");
        }
      }

      // Create chapter link if provided
      if (data.chapterNum?.trim() && data.chapterUrl?.trim()) {
        try {
          await prisma.chapterLink.create({
            data: {
              comicId: comic.id,
              sourceId,
              chapterNum: data.chapterNum,
              url: data.chapterUrl,
              language: (data.chapterLanguage as Language) ?? "EN",
            },
          });
        } catch {
          console.warn("[ComicService.createComicFromUser] Chapter link creation failed.");
        }
      }

      // Create bookmark for the user
      await prisma.bookmark.create({
        data: {
          userId: data.userId,
          comicId: comic.id,
          currentChapter: data.chapterNum?.trim() || "1",
        },
      });

      return { success: true as const, data: comic };
    } catch (error) {
      console.error("[ComicService.createComicFromUser]", error);
      return { error: "Failed to create comic." };
    }
  }
}

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

      if (!comic) {
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
}

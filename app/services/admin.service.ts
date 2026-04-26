import { prisma } from "@/lib/prisma";

/**
 * AdminService — Pure service layer for admin-related DB operations.
 * No auth checks here; those belong in the actions layer.
 */
export class AdminService {
  /**
   * Fetch all comics with full relations for admin management.
   */
  static async getAllComics() {
    try {
      const comics = await prisma.comic.findMany({
        include: {
          sources: true,
          chapterLinks: {
            orderBy: { chapterNum: "asc" },
            include: { source: true },
          },
          _count: { select: { bookmarks: true, chapterLinks: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
      return { success: true as const, data: comics };
    } catch (error) {
      console.error("[AdminService.getAllComics]", error);
      return { error: "Failed to fetch comics." };
    }
  }

  /**
   * Create a new comic.
   */
  static async createComic(data: {
    title: string;
    status?: string;
    description?: string;
    imageUrl?: string;
  }) {
    try {
      const comic = await prisma.comic.create({
        data: {
          title: data.title,
          status: (data.status as "ONGOING" | "COMPLETED" | "HIATUS" | "CANCELLED") ?? "ONGOING",
          description: data.description ?? null,
          imageUrl: data.imageUrl ?? null,
        },
      });
      return { success: true as const, data: comic };
    } catch (error) {
      console.error("[AdminService.createComic]", error);
      return { error: "Failed to create comic." };
    }
  }

  /**
   * Update a comic's fields.
   */
  static async updateComic(
    comicId: string,
    data: {
      title?: string;
      status?: string;
      description?: string;
      imageUrl?: string;
    }
  ) {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

      const comic = await prisma.comic.update({
        where: { id: comicId },
        data: updateData,
      });
      return { success: true as const, data: comic };
    } catch (error) {
      console.error("[AdminService.updateComic]", error);
      return { error: "Failed to update comic." };
    }
  }

  /**
   * Delete a comic and all related records (cascade).
   */
  static async deleteComic(comicId: string) {
    try {
      await prisma.comic.delete({ where: { id: comicId } });
      return { success: true as const };
    } catch (error) {
      console.error("[AdminService.deleteComic]", error);
      return { error: "Failed to delete comic." };
    }
  }

  /**
   * Add a source URL to a comic.
   */
  static async addComicSource(comicId: string, url: string, siteName?: string) {
    try {
      const source = await prisma.comicSource.create({
        data: {
          comicId,
          url,
          siteName: siteName ?? new URL(url).hostname.replace(/^www\./, ""),
        },
      });
      return { success: true as const, data: source };
    } catch (error) {
      console.error("[AdminService.addComicSource]", error);
      return { error: "Failed to add source." };
    }
  }

  /**
   * Delete a comic source.
   */
  static async deleteComicSource(sourceId: string) {
    try {
      await prisma.comicSource.delete({ where: { id: sourceId } });
      return { success: true as const };
    } catch (error) {
      console.error("[AdminService.deleteComicSource]", error);
      return { error: "Failed to delete source." };
    }
  }

  /**
   * Add a chapter link to a comic.
   */
  static async addChapterLink(
    comicId: string,
    chapterNum: string,
    url: string
  ) {
    try {
      // Try to find or create a matching source
      const parsedUrl = new URL(url);
      const siteOrigin = parsedUrl.origin;
      const siteName = parsedUrl.hostname.replace(/^www\./, "");

      const source = await prisma.comicSource.upsert({
        where: { comicId_url: { comicId, url: siteOrigin } },
        update: {},
        create: { comicId, url: siteOrigin, siteName },
      });

      const chapterLink = await prisma.chapterLink.create({
        data: {
          comicId,
          sourceId: source.id,
          chapterNum,
          url,
        },
      });
      return { success: true as const, data: chapterLink };
    } catch (error) {
      console.error("[AdminService.addChapterLink]", error);
      return { error: "Failed to add chapter link." };
    }
  }

  /**
   * Delete a chapter link.
   */
  static async deleteChapterLink(linkId: string) {
    try {
      await prisma.chapterLink.delete({ where: { id: linkId } });
      return { success: true as const };
    } catch (error) {
      console.error("[AdminService.deleteChapterLink]", error);
      return { error: "Failed to delete chapter link." };
    }
  }

  /**
   * Fetch all users with their roles.
   */
  static async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          banned: true,
          createdAt: true,
          _count: { select: { bookmarks: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return { success: true as const, data: users };
    } catch (error) {
      console.error("[AdminService.getAllUsers]", error);
      return { error: "Failed to fetch users." };
    }
  }
}

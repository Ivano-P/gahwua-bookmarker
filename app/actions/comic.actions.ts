"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ComicService } from "@/app/services/comic.service";
import type { Language } from "@prisma/client";

/**
 * Helper to get the authenticated user's session.
 * Returns the session or null.
 */
async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Upsert the user's private bookmark to update their current chapter.
 */
export async function syncUserBookmarkAction(
  comicId: string,
  chapterNum: string
) {
  const session = await getAuthSession();
  if (!session) {
    return { error: "You must be signed in to bookmark." };
  }

  return ComicService.upsertBookmark(session.user.id, comicId, chapterNum);
}

/**
 * Add a chapter link to the global crowdsourced pool.
 * Auto-extracts the site origin and creates a ComicSource if needed.
 */
export async function addGlobalChapterLinkAction(
  comicId: string,
  chapterNum: string,
  chapterUrl: string,
  language: Language = "EN"
) {
  const session = await getAuthSession();
  if (!session) {
    return { error: "You must be signed in to contribute chapter links." };
  }

  // Basic URL validation
  try {
    new URL(chapterUrl);
  } catch {
    return { error: "Invalid chapter URL provided." };
  }

  if (!chapterNum.trim()) {
    return { error: "Chapter number is required." };
  }

  return ComicService.addChapterLink(comicId, chapterNum, chapterUrl, language);
}

/**
 * Fetch details for a specific comic (public — no auth needed).
 */
export async function getCafeComicDetailsAction(comicId: string) {
  return ComicService.getComicById(comicId);
}

/**
 * Fetch all bookmarks for the authenticated user.
 */
export async function getUserBookmarksAction() {
  const session = await getAuthSession();
  if (!session) {
    return { error: "You must be signed in to view bookmarks." };
  }

  return ComicService.getUserBookmarks(session.user.id);
}

/**
 * Check if the current user has bookmarked a specific comic.
 */
export async function checkUserBookmarkAction(comicId: string) {
  const session = await getAuthSession();
  if (!session) {
    return { success: true as const, data: null };
  }

  return ComicService.getUserBookmarkForComic(session.user.id, comicId);
}

/**
 * Search comics by title for autocomplete (only APPROVED).
 */
export async function searchComicsAction(query: string) {
  const session = await getAuthSession();
  if (!session) {
    return { error: "You must be signed in." };
  }

  if (!query.trim() || query.trim().length < 2) {
    return { success: true as const, data: [] };
  }

  return ComicService.searchComicsByTitle(query.trim());
}

/**
 * Create a comic from the bookmarker "Add New" modal.
 * If the comic already exists (existingComicId provided), just bookmark it.
 * Otherwise, create a new comic (approval depends on trustedEditor status).
 */
export async function addComicFromBookmarkerAction(data: {
  existingComicId?: string;
  title?: string;
  altTitles?: string[];
  status?: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
  sourceLanguage?: string;
  chapterNum?: string;
  chapterUrl?: string;
  chapterLanguage?: string;
}) {
  const session = await getAuthSession();
  if (!session) {
    return { error: "You must be signed in." };
  }

  // Mode 1: Bookmark an existing comic
  if (data.existingComicId) {
    const chapterNum = data.chapterNum?.trim() || "1";
    const result = await ComicService.upsertBookmark(
      session.user.id,
      data.existingComicId,
      chapterNum
    );

    // Also add chapter link if URL is provided
    if (data.chapterUrl?.trim() && !("error" in result)) {
      await ComicService.addChapterLink(
        data.existingComicId,
        chapterNum,
        data.chapterUrl.trim(),
        (data.chapterLanguage as import("@prisma/client").Language) ?? "EN"
      );
    }

    return result;
  }

  // Mode 2: Create a new comic + bookmark
  if (!data.title?.trim()) {
    return { error: "Title is required." };
  }

  // Get user's trustedEditor status
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { trustedEditor: true },
  });

  return ComicService.createComicFromUser({
    title: data.title.trim(),
    altTitles: data.altTitles,
    status: data.status,
    description: data.description,
    imageUrl: data.imageUrl,
    sourceUrl: data.sourceUrl,
    sourceLanguage: data.sourceLanguage,
    chapterNum: data.chapterNum,
    chapterUrl: data.chapterUrl,
    chapterLanguage: data.chapterLanguage,
    userId: session.user.id,
    isTrusted: user?.trustedEditor ?? true,
  });
}

/**
 * Add alternative titles to a comic.
 * Any authenticated user can contribute alt titles.
 */
export async function addAltTitlesAction(
  comicId: string,
  altTitles: string[]
) {
  const session = await getAuthSession();
  if (!session) {
    return { error: "You must be signed in." };
  }

  const filtered = altTitles.map((t) => t.trim()).filter(Boolean);
  if (filtered.length === 0) {
    return { success: true as const };
  }

  return ComicService.addAltTitlesToComic(comicId, filtered);
}

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ComicService } from "@/app/services/comic.service";

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
  chapterUrl: string
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

  return ComicService.addChapterLink(comicId, chapterNum, chapterUrl);
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

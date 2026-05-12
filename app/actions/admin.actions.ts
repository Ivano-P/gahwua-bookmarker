"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminService } from "@/app/services/admin.service";
import type { Language } from "@prisma/client";

/**
 * Helper: get session and verify admin role.
 * Returns session or null if not admin.
 */
async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}

// ── Comic Actions ──────────────────────────────

export async function getAdminComicsAction() {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.getAllComics();
}

export async function createComicAction(data: {
  title: string;
  altTitles?: string[];
  status?: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
  sourceLanguage?: string;
}) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  if (!data.title.trim()) return { error: "Title is required." };
  return AdminService.createComic(data);
}

export async function updateComicAction(
  comicId: string,
  data: {
    title?: string;
    status?: string;
    description?: string;
    imageUrl?: string;
  }
) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.updateComic(comicId, data);
}

export async function deleteComicAction(comicId: string) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.deleteComic(comicId);
}

// ── Source Actions ──────────────────────────────

export async function addSourceAction(
  comicId: string,
  url: string,
  siteName?: string,
  language: Language = "EN"
) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  try {
    new URL(url);
  } catch {
    return { error: "Invalid URL." };
  }

  return AdminService.addComicSource(comicId, url, siteName, language);
}

export async function deleteSourceAction(sourceId: string) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.deleteComicSource(sourceId);
}

// ── Chapter Link Actions ───────────────────────

export async function addChapterAction(
  comicId: string,
  chapterNum: string,
  url: string,
  language: Language = "EN"
) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  if (!chapterNum.trim()) return { error: "Chapter number is required." };
  try {
    new URL(url);
  } catch {
    return { error: "Invalid chapter URL." };
  }

  return AdminService.addChapterLink(comicId, chapterNum, url, language);
}

export async function deleteChapterAction(linkId: string) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.deleteChapterLink(linkId);
}

// ── User Actions ───────────────────────────────

export async function getAdminUsersAction() {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.getAllUsers();
}

export async function toggleTrustedEditorAction(
  userId: string,
  value: boolean
) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.toggleTrustedEditor(userId, value);
}

// ── Pending Comic Actions ──────────────────────

export async function getPendingComicsAction() {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.getPendingComics();
}

export async function approveComicAction(comicId: string) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.approveComic(comicId);
}

export async function rejectComicAction(comicId: string) {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  return AdminService.rejectComic(comicId);
}

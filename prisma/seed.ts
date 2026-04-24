import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. Upsert Comics ──────────────────────────────────────────────

  const returnOfTheDevourer = await prisma.comic.upsert({
    where: { title: "Return of the Devourer" },
    update: {},
    create: {
      title: "Return of the Devourer",
      altTitles: ["귀환한 포식자"],
      description:
        "After being devoured by the Abyss, he returns with the power to consume everything. A thrilling action-fantasy about revenge and domination.",
      status: "ONGOING",
      genres: ["ACTION", "FANTASY", "MANHWA"],
    },
  });
  console.log("  ✔ Comic:", returnOfTheDevourer.title);

  const heavenlyDemon = await prisma.comic.upsert({
    where: { title: "The Heavenly Demon Can't Live a Normal Life" },
    update: {},
    create: {
      title: "The Heavenly Demon Can't Live a Normal Life",
      altTitles: ["천마는 평범하게 살 수 없다"],
      description:
        "The Heavenly Demon, the strongest being in the Murim, is reborn as the eldest son of a declining noble family. He decides to live a normal life... but that's easier said than done.",
      status: "ONGOING",
      genres: ["ACTION", "FANTASY", "MARTIAL_ARTS", "MANHWA"],
    },
  });
  console.log("  ✔ Comic:", heavenlyDemon.title);

  // ── 2. Upsert ComicSources ────────────────────────────────────────

  const mangakakalot = await prisma.comicSource.upsert({
    where: {
      comicId_url: {
        comicId: returnOfTheDevourer.id,
        url: "https://www.mangakakalot.gg",
      },
    },
    update: {},
    create: {
      comicId: returnOfTheDevourer.id,
      url: "https://www.mangakakalot.gg",
      siteName: "mangakakalot.gg",
    },
  });
  console.log("  ✔ Source:", mangakakalot.siteName);

  const mangafire = await prisma.comicSource.upsert({
    where: {
      comicId_url: {
        comicId: heavenlyDemon.id,
        url: "https://mangafire.to",
      },
    },
    update: {},
    create: {
      comicId: heavenlyDemon.id,
      url: "https://mangafire.to",
      siteName: "mangafire.to",
    },
  });
  console.log("  ✔ Source:", mangafire.siteName);

  // Also add manhwaclan as a general source for the first comic
  const manhwaclan = await prisma.comicSource.upsert({
    where: {
      comicId_url: {
        comicId: returnOfTheDevourer.id,
        url: "https://manhwaclan.com",
      },
    },
    update: {},
    create: {
      comicId: returnOfTheDevourer.id,
      url: "https://manhwaclan.com",
      siteName: "manhwaclan.com",
    },
  });
  console.log("  ✔ Source:", manhwaclan.siteName);

  // ── 3. Upsert ChapterLinks ───────────────────────────────────────

  await prisma.chapterLink.upsert({
    where: {
      comicId_chapterNum_url: {
        comicId: returnOfTheDevourer.id,
        chapterNum: "24",
        url: "https://www.mangakakalot.gg/manga/return-of-the-devourer/chapter-24",
      },
    },
    update: {},
    create: {
      comicId: returnOfTheDevourer.id,
      sourceId: mangakakalot.id,
      chapterNum: "24",
      url: "https://www.mangakakalot.gg/manga/return-of-the-devourer/chapter-24",
    },
  });
  console.log("  ✔ ChapterLink: Return of the Devourer Ch.24");

  await prisma.chapterLink.upsert({
    where: {
      comicId_chapterNum_url: {
        comicId: heavenlyDemon.id,
        chapterNum: "197",
        url: "https://mangafire.to/read/the-heavenly-demon-cant-live-a-normal-lifee.zlnn3/en/chapter-197",
      },
    },
    update: {},
    create: {
      comicId: heavenlyDemon.id,
      sourceId: mangafire.id,
      chapterNum: "197",
      url: "https://mangafire.to/read/the-heavenly-demon-cant-live-a-normal-lifee.zlnn3/en/chapter-197",
    },
  });
  console.log("  ✔ ChapterLink: Heavenly Demon Ch.197");

  // ── 4. Upsert Bookmarks for user tykeno ───────────────────────────

  const tykenoUser = await prisma.user.findFirst({
    where: { email: "kerry.i.p@hotmail.com" },
  });

  if (tykenoUser) {
    await prisma.bookmark.upsert({
      where: {
        userId_comicId: {
          userId: tykenoUser.id,
          comicId: returnOfTheDevourer.id,
        },
      },
      update: { currentChapter: "24" },
      create: {
        userId: tykenoUser.id,
        comicId: returnOfTheDevourer.id,
        currentChapter: "24",
      },
    });
    console.log("  ✔ Bookmark: tykeno → Return of the Devourer @ Ch.24");

    await prisma.bookmark.upsert({
      where: {
        userId_comicId: {
          userId: tykenoUser.id,
          comicId: heavenlyDemon.id,
        },
      },
      update: { currentChapter: "197" },
      create: {
        userId: tykenoUser.id,
        comicId: heavenlyDemon.id,
        currentChapter: "197",
      },
    });
    console.log("  ✔ Bookmark: tykeno → Heavenly Demon @ Ch.197");
  } else {
    console.log(
      "  ⚠ User kerry.i.p@hotmail.com not found — skipping bookmarks."
    );
    console.log(
      "    Sign up first, then re-run: npx tsx prisma/seed.ts"
    );
  }

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

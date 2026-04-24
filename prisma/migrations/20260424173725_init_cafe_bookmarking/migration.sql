-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('ACTION', 'ADVENTURE', 'COMEDY', 'DRAMA', 'FANTASY', 'ISEKAI', 'MANGA', 'MANHUA', 'MANHWA', 'MARTIAL_ARTS', 'ROMANCE', 'SHOUNEN', 'WEBTOON');

-- CreateTable
CREATE TABLE "comic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "altTitles" TEXT[],
    "description" TEXT,
    "imageUrl" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'ONGOING',
    "genres" "Genre"[],
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comic_source" (
    "id" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "siteName" TEXT,

    CONSTRAINT "comic_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_link" (
    "id" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "sourceId" TEXT,
    "chapterNum" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapter_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "currentChapter" TEXT NOT NULL,
    "userRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comic_title_key" ON "comic"("title");

-- CreateIndex
CREATE UNIQUE INDEX "comic_source_comicId_url_key" ON "comic_source"("comicId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "chapter_link_comicId_chapterNum_url_key" ON "chapter_link"("comicId", "chapterNum", "url");

-- CreateIndex
CREATE UNIQUE INDEX "bookmark_userId_comicId_key" ON "bookmark"("userId", "comicId");

-- AddForeignKey
ALTER TABLE "comic_source" ADD CONSTRAINT "comic_source_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_link" ADD CONSTRAINT "chapter_link_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_link" ADD CONSTRAINT "chapter_link_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "comic_source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

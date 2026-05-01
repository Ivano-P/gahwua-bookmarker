-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'FR', 'JA', 'KO', 'ZH', 'ES', 'PT', 'DE', 'IT', 'TH', 'VI', 'TR', 'ID', 'AR', 'RU', 'PL', 'OTHER');

-- DropIndex
DROP INDEX "chapter_link_comicId_chapterNum_url_key";

-- AlterTable
ALTER TABLE "chapter_link" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';

-- AlterTable
ALTER TABLE "comic_source" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';

-- CreateIndex
CREATE UNIQUE INDEX "chapter_link_comicId_chapterNum_url_language_key" ON "chapter_link"("comicId", "chapterNum", "url", "language");

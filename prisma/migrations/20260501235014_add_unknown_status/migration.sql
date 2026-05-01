-- AlterEnum
ALTER TYPE "PublicationStatus" ADD VALUE 'UNKNOWN';

-- AlterTable
ALTER TABLE "comic" ALTER COLUMN "status" SET DEFAULT 'UNKNOWN';

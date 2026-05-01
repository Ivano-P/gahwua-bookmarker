-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "comic" ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "submittedById" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "trustedEditor" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "comic" ADD CONSTRAINT "comic_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

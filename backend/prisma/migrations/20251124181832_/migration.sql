-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "trailer" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Movie_deletedAt_idx" ON "Movie"("deletedAt");

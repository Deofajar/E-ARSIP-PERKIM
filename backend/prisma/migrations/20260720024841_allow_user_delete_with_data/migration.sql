-- DropForeignKey
ALTER TABLE "archives" DROP CONSTRAINT "archives_uploaderId_fkey";

-- DropForeignKey
ALTER TABLE "user_activities" DROP CONSTRAINT "user_activities_userId_fkey";

-- AlterTable
ALTER TABLE "archives" ADD COLUMN     "uploaderNama" TEXT,
ALTER COLUMN "uploaderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_activities" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

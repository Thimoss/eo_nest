-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('IN_PROGRESS', 'NEED_CHECKED', 'NEED_CONFIRMED', 'APPROVED');

-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN "status" "public"."DocumentStatus" NOT NULL DEFAULT 'IN_PROGRESS';

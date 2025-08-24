/*
  Warnings:

  - You are about to drop the `Sheet` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Item" ALTER COLUMN "minimum" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "public"."Sheet";

-- CreateTable
CREATE TABLE "public"."JobSection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "totalMaterialPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFeePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "documentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "JobSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemJobSection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "minimumVolume" DOUBLE PRECISION NOT NULL,
    "materialPricePerUnit" DOUBLE PRECISION NOT NULL,
    "feePricePerUnit" DOUBLE PRECISION NOT NULL,
    "totalMaterialPrice" DOUBLE PRECISION NOT NULL,
    "totalFeePrice" DOUBLE PRECISION NOT NULL,
    "information" TEXT,
    "jobSectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ItemJobSection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."JobSection" ADD CONSTRAINT "JobSection_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemJobSection" ADD CONSTRAINT "ItemJobSection_jobSectionId_fkey" FOREIGN KEY ("jobSectionId") REFERENCES "public"."JobSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

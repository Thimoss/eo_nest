/*
  Warnings:

  - Added the required column `categoryCode` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectorNo` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryCode` to the `Sector` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "categoryCode" TEXT NOT NULL,
ADD COLUMN     "sectorNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sector" ADD COLUMN     "categoryCode" TEXT NOT NULL;

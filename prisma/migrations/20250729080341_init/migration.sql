/*
  Warnings:

  - Added the required column `singleItem` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `singleItem` to the `SubsItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "singleItem" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "SubsItem" ADD COLUMN     "singleItem" BOOLEAN NOT NULL;

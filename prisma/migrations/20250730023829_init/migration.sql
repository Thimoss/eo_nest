/*
  Warnings:

  - You are about to drop the `SubsItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubsSubItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubsItem" DROP CONSTRAINT "SubsItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "SubsSubItem" DROP CONSTRAINT "SubsSubItem_subsItemId_fkey";

-- DropTable
DROP TABLE "SubsItem";

-- DropTable
DROP TABLE "SubsSubItem";

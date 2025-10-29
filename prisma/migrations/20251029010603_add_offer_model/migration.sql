/*
  Warnings:

  - You are about to drop the `Offer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Offer" DROP CONSTRAINT "Offer_itemId_fkey";

-- DropTable
DROP TABLE "public"."Offer";

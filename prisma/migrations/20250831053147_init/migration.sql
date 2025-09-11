/*
  Warnings:

  - You are about to drop the column `feePerUnit` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Item" DROP COLUMN "feePerUnit",
ADD COLUMN     "feePricePerUnit" DOUBLE PRECISION;

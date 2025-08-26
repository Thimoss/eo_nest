/*
  Warnings:

  - Added the required column `unit` to the `ItemJobSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ItemJobSection" ADD COLUMN     "unit" TEXT NOT NULL;

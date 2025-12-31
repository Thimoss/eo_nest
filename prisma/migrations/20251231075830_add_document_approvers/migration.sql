/*
  Warnings:

  - You are about to drop the column `checkedByName` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `checkedByPosition` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `confirmedByName` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `confirmedByPosition` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `preparedByName` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `preparedByPosition` on the `Document` table. All the data in the column will be lost.
  - Added the required column `checkedById` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `confirmedById` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdById` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_createdById_fkey";

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "checkedByName",
DROP COLUMN "checkedByPosition",
DROP COLUMN "confirmedByName",
DROP COLUMN "confirmedByPosition",
DROP COLUMN "preparedByName",
DROP COLUMN "preparedByPosition",
ADD COLUMN     "checkedById" INTEGER NOT NULL,
ADD COLUMN     "confirmedById" INTEGER NOT NULL,
ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

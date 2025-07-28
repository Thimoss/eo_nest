/*
  Warnings:

  - A unique constraint covering the columns `[no]` on the table `Sector` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[no,categoryId]` on the table `Sector` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Sector_no_key" ON "Sector"("no");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_no_categoryId_key" ON "Sector"("no", "categoryId");

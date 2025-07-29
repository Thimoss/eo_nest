/*
  Warnings:

  - A unique constraint covering the columns `[no]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[no]` on the table `SubsItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[no]` on the table `SubsSubItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Item_no_key" ON "Item"("no");

-- CreateIndex
CREATE UNIQUE INDEX "SubsItem_no_key" ON "SubsItem"("no");

-- CreateIndex
CREATE UNIQUE INDEX "SubsSubItem_no_key" ON "SubsSubItem"("no");

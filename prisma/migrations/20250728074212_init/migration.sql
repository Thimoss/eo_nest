-- CreateTable
CREATE TABLE "Sector" (
    "id" SERIAL NOT NULL,
    "no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "minimum" INTEGER,
    "unit" TEXT,
    "materialPricePerUnit" DOUBLE PRECISION,
    "feePerUnit" DOUBLE PRECISION,
    "sectorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubsItem" (
    "id" SERIAL NOT NULL,
    "no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "minimum" INTEGER,
    "unit" TEXT,
    "materialPricePerUnit" DOUBLE PRECISION,
    "feePerUnit" DOUBLE PRECISION,
    "itemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubsSubItem" (
    "id" SERIAL NOT NULL,
    "no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minimum" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "materialPricePerUnit" DOUBLE PRECISION NOT NULL,
    "feePerUnit" DOUBLE PRECISION NOT NULL,
    "subsItemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubsSubItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsItem" ADD CONSTRAINT "SubsItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsSubItem" ADD CONSTRAINT "SubsSubItem_subsItemId_fkey" FOREIGN KEY ("subsItemId") REFERENCES "SubsItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

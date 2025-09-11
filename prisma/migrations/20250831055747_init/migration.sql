-- DropForeignKey
ALTER TABLE "public"."Item" DROP CONSTRAINT "Item_sectorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemJobSection" DROP CONSTRAINT "ItemJobSection_jobSectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobSection" DROP CONSTRAINT "JobSection_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Sector" DROP CONSTRAINT "Sector_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Sector" ADD CONSTRAINT "Sector_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "public"."Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobSection" ADD CONSTRAINT "JobSection_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemJobSection" ADD CONSTRAINT "ItemJobSection_jobSectionId_fkey" FOREIGN KEY ("jobSectionId") REFERENCES "public"."JobSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

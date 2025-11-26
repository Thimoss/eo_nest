-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "createdById" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "checkedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "qrCodeUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "checkedByName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "checkedByPosition" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "confirmedByName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "confirmedByPosition" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "percentageBenefitsAndRisks" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "preparedByName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "preparedByPosition" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "recapitulationLocation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "totalBenefitsAndRisks" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalMaterialAndFee" DOUBLE PRECISION NOT NULL DEFAULT 0;

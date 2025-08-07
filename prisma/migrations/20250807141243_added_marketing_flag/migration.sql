-- AlterTable
ALTER TABLE "public"."AutoUsata" ADD COLUMN     "inVetrina" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pubblicata" BOOLEAN NOT NULL DEFAULT true;

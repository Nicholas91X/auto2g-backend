/*
  Warnings:

  - You are about to drop the column `immagine` on the `AutoUsata` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AutoUsataStatus" AS ENUM ('DISPONIBILE', 'VENDUTA', 'IN_ARRIVO', 'IN_TRATTATIVA', 'IN_RIPARAZIONE');

-- AlterTable
ALTER TABLE "public"."AutoUsata" DROP COLUMN "immagine",
ADD COLUMN     "stato" "public"."AutoUsataStatus" NOT NULL DEFAULT 'DISPONIBILE';

-- CreateTable
CREATE TABLE "public"."ImmagineAuto" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "autoUsataId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImmagineAuto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ImmagineAuto" ADD CONSTRAINT "ImmagineAuto_autoUsataId_fkey" FOREIGN KEY ("autoUsataId") REFERENCES "public"."AutoUsata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

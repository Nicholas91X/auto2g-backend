-- CreateEnum
CREATE TYPE "public"."Carburante" AS ENUM ('BENZINA', 'DIESEL', 'GPL', 'METANO', 'IBRIDA', 'ELETTRICA');

-- CreateEnum
CREATE TYPE "public"."TipoDiCambio" AS ENUM ('MANUALE', 'AUTOMATICO');

-- CreateEnum
CREATE TYPE "public"."Trazione" AS ENUM ('ANTERIORE', 'POSTERIORE', 'INTEGRALE');

-- AlterTable
ALTER TABLE "public"."AutoUsata" ADD COLUMN     "abs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "airbag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "carburante" "public"."Carburante",
ADD COLUMN     "cerchiInLega" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cilindrata" INTEGER,
ADD COLUMN     "classeEmissione" TEXT,
ADD COLUMN     "climatizzatore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "coloreEsterno" TEXT,
ADD COLUMN     "cruiseControl" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interniInPelle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "navigatore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noteOptional" TEXT,
ADD COLUMN     "numeroPorte" INTEGER,
ADD COLUMN     "numeroPosti" INTEGER,
ADD COLUMN     "potenzaCV" INTEGER,
ADD COLUMN     "potenzaKW" INTEGER,
ADD COLUMN     "sensoriParcheggio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "servosterzo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tipoDiCambio" "public"."TipoDiCambio",
ADD COLUMN     "trazione" "public"."Trazione";

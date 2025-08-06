-- CreateTable
CREATE TABLE "public"."AutoUsata" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "modello" TEXT NOT NULL,
    "targa" TEXT NOT NULL,
    "anno" INTEGER NOT NULL,
    "prezzo" DOUBLE PRECISION NOT NULL,
    "km" INTEGER NOT NULL,
    "immagine" TEXT,
    "descrizione" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoUsata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutoUsata_targa_key" ON "public"."AutoUsata"("targa");

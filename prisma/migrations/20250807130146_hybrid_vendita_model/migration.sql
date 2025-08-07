-- CreateTable
CREATE TABLE "public"."Vendita" (
    "id" SERIAL NOT NULL,
    "dataVendita" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prezzoFinale" DOUBLE PRECISION NOT NULL,
    "autoId" INTEGER NOT NULL,
    "acquirenteId" INTEGER,
    "acquirenteNomeCognome" TEXT NOT NULL,
    "acquirenteInfo" TEXT,

    CONSTRAINT "Vendita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendita_autoId_key" ON "public"."Vendita"("autoId");

-- AddForeignKey
ALTER TABLE "public"."Vendita" ADD CONSTRAINT "Vendita_autoId_fkey" FOREIGN KEY ("autoId") REFERENCES "public"."AutoUsata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vendita" ADD CONSTRAINT "Vendita_acquirenteId_fkey" FOREIGN KEY ("acquirenteId") REFERENCES "public"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

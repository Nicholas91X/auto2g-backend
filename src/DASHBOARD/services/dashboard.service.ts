import { Injectable } from "@nestjs/common"
import { PrismaRepository } from "../../database/repositories/prisma.repository"
import { AutoUsataStatusEnum } from "../../AUTO_USATA/enums/autoUsataStatusEnum"

@Injectable()
export class DashboardService {
  constructor(private readonly db: PrismaRepository) {}

  async getSummary() {
    // Calcoli esistenti
    const totaleAutoDisponibili = await this.db.autoUsata.count({
      where: { stato: { not: AutoUsataStatusEnum.VENDUTA } },
    })
    const autoInTrattativa = await this.db.autoUsata.count({
      where: { stato: AutoUsataStatusEnum.IN_TRATTATIVA },
    })
    const oggi = new Date()
    const inizioMese = new Date(oggi.getFullYear(), oggi.getMonth(), 1)
    const venditeMeseCorrente = await this.db.vendita.count({
      where: { dataVendita: { gte: inizioMese } },
    })
    const ricavoMeseCorrente = await this.db.vendita.aggregate({
      _sum: { prezzoFinale: true },
      where: { dataVendita: { gte: inizioMese } },
    })

    const valoreInventario = await this.db.autoUsata.aggregate({
      _sum: { prezzo: true },
      where: { stato: { not: AutoUsataStatusEnum.VENDUTA } },
    })

    const venditeDelMeseConAuto = await this.db.vendita.findMany({
      where: { dataVendita: { gte: inizioMese } },
      include: { auto: true },
    })

    const profittoMeseCorrente = venditeDelMeseConAuto.reduce(
      (sum, vendita) => {
        const profitto = vendita.prezzoFinale - (vendita.auto.costo || 0)
        return sum + profitto
      },
      0,
    )

    return {
      totaleAutoDisponibili,
      autoInTrattativa,
      valoreInventario: valoreInventario._sum.prezzo || 0,
      venditeMeseCorrente,
      ricavoMeseCorrente: ricavoMeseCorrente._sum.prezzoFinale || 0,
      profittoMeseCorrente,
    }
  }

  // STATISTICHE PER MARCA
  async getPerformancePerMarca() {
    const performance = await this.db.autoUsata.groupBy({
      by: ["marca"],
      _count: {
        id: true,
      },
      _avg: {
        prezzo: true,
      },
      where: {
        stato: { not: AutoUsataStatusEnum.VENDUTA },
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    })

    return performance.map((item) => ({
      marca: item.marca,
      numeroVetture: item._count.id,
      prezzoMedio: item._avg.prezzo,
    }))
  }

  // ATTIVITÀ RECENTE
  async getAttivitaRecente() {
    const ultimeAutoAggiunte = await this.db.autoUsata.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, marca: true, modello: true, createdAt: true },
    })

    const ultimeVendite = await this.db.vendita.findMany({
      take: 5,
      orderBy: { dataVendita: "desc" },
      select: {
        id: true,
        acquirenteNomeCognome: true,
        prezzoFinale: true,
        dataVendita: true,
        auto: { select: { marca: true, modello: true } },
      },
    })

    return { ultimeAutoAggiunte, ultimeVendite }
  }
}

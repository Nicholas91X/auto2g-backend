import { Injectable } from "@nestjs/common"
import { AutoUsataStatus } from "@prisma/client"
import { PrismaRepository } from "../../database/repositories/prisma.repository"

@Injectable()
export class DashboardService {
  constructor(private readonly db: PrismaRepository) {}

  async getSummary() {
    const totaleAutoDisponibili = await this.db.autoUsata.count({
      where: { stato: AutoUsataStatus.DISPONIBILE },
    })

    const autoInTrattativa = await this.db.autoUsata.count({
      where: { stato: AutoUsataStatus.IN_TRATTATIVA },
    })

    // Calcola l'inizio del mese corrente
    const oggi = new Date()
    const inizioMese = new Date(oggi.getFullYear(), oggi.getMonth(), 1)

    const venditeMeseCorrente = await this.db.vendita.count({
      where: { dataVendita: { gte: inizioMese } },
    })

    const ricavoMeseCorrente = await this.db.vendita.aggregate({
      _sum: { prezzoFinale: true },
      where: { dataVendita: { gte: inizioMese } },
    })

    return {
      totaleAutoDisponibili,
      autoInTrattativa,
      venditeMeseCorrente,
      ricavoMeseCorrente: ricavoMeseCorrente._sum.prezzoFinale || 0,
    }
  }
}

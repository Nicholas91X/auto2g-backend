import { Injectable } from "@nestjs/common"
import { PrismaRepository } from "../../database/repositories/prisma.repository"
import { Prisma, Vendita } from "@prisma/client"

@Injectable()
export class VenditaRepository {
  constructor(private readonly db: PrismaRepository) {}

  private readonly includeClause = {
    auto: { include: { immagini: true } },
    acquirente: true,
  }

  create(data: Prisma.VenditaUncheckedCreateInput): Promise<Vendita> {
    return this.db.vendita.create({ data })
  }

  findAll(): Promise<Vendita[]> {
    return this.db.vendita.findMany({
      include: this.includeClause,
      orderBy: { dataVendita: "desc" },
    })
  }

  findById(id: number): Promise<Vendita | null> {
    return this.db.vendita.findUnique({
      where: { id },
      include: this.includeClause,
    })
  }

  update(
    id: number,
    data: Prisma.VenditaUncheckedUpdateInput,
  ): Promise<Vendita> {
    return this.db.vendita.update({ where: { id }, data })
  }

  remove(id: number): Promise<Vendita> {
    return this.db.vendita.delete({ where: { id } })
  }
}

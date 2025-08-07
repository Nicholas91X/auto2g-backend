import { Injectable } from "@nestjs/common"
import { PrismaRepository } from "../../database/repositories/prisma.repository"
import { Prisma, Vendita } from "@prisma/client"

@Injectable()
export class VenditaRepository {
  constructor(private readonly db: PrismaRepository) {}

  create(data: Prisma.VenditaUncheckedCreateInput): Promise<Vendita> {
    return this.db.vendita.create({ data })
  }
}

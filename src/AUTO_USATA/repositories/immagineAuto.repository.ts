import { Injectable } from "@nestjs/common"
import { PrismaRepository } from "../../database/repositories/prisma.repository"
import { ImmagineAuto } from "@prisma/client"

@Injectable()
export class ImmagineAutoRepository {
  constructor(private readonly db: PrismaRepository) {}

  async create(url: string, autoUsataId: number): Promise<ImmagineAuto> {
    return this.db.immagineAuto.create({
      data: {
        url,
        autoUsataId,
      },
    })
  }

  async findById(id: number): Promise<ImmagineAuto | null> {
    return this.db.immagineAuto.findUnique({ where: { id } })
  }

  async remove(id: number): Promise<ImmagineAuto> {
    return this.db.immagineAuto.delete({ where: { id } })
  }

  async removeManyByAutoId(autoUsataId: number): Promise<{ count: number }> {
    return this.db.immagineAuto.deleteMany({
      where: { autoUsataId },
    })
  }
}

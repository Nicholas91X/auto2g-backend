import { Injectable } from "@nestjs/common"
import { PrismaRepository } from "../../database/repositories/prisma.repository"
import { AutoUsata, ImmagineAuto, Prisma } from "@prisma/client"

export type AutoUsataWithImmagini = AutoUsata & {
  immagini: ImmagineAuto[];
};

@Injectable()
export class AutoUsataRepository {
  constructor(private readonly db: PrismaRepository) {}

  async create(data: Prisma.AutoUsataCreateInput): Promise<AutoUsata> {
    return this.db.autoUsata.create({ data });
  }

  async findAll(): Promise<AutoUsataWithImmagini[]> {
    return this.db.autoUsata.findMany({
      include: { immagini: true },
      orderBy: { createdAt: "desc" },
    })
  }

  async findById(id: number): Promise<AutoUsataWithImmagini | null> {
    return this.db.autoUsata.findUnique({
      where: { id },
      include: { immagini: true },
    })
  }

  async update(
    id: number,
    data: Prisma.AutoUsataUpdateInput,
  ): Promise<AutoUsata> {
    return this.db.autoUsata.update({ where: { id }, data });
  }

  async remove(id: number): Promise<AutoUsata> {
    return this.db.autoUsata.delete({ where: { id } });
  }
}
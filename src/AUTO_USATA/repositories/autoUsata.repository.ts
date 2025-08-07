import { Injectable } from "@nestjs/common"
import { PrismaRepository } from "../../database/repositories/prisma.repository"
import { AutoUsata, ImmagineAuto, Prisma } from "@prisma/client"
import { FiltroAutoUsataDto } from "../dtos/filtroAutoUsata.dto"
import { AutoUsataStatusEnum } from "../enums/autoUsataStatusEnum"

export type AutoUsataWithImmagini = AutoUsata & {
  immagini: ImmagineAuto[]
}

@Injectable()
export class AutoUsataRepository {
  constructor(private readonly db: PrismaRepository) {}

  async create(data: Prisma.AutoUsataCreateInput): Promise<AutoUsata> {
    return this.db.autoUsata.create({ data })
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
    return this.db.autoUsata.update({ where: { id }, data })
  }

  async remove(id: number): Promise<AutoUsata> {
    return this.db.autoUsata.delete({ where: { id } })
  }

  async findAllFiltered(
    filtri: FiltroAutoUsataDto,
  ): Promise<AutoUsataWithImmagini[]> {
    const where: Prisma.AutoUsataWhereInput = {}

    if (filtri.marca) {
      where.marca = { contains: filtri.marca, mode: "insensitive" }
    }
    if (filtri.modello) {
      where.modello = { contains: filtri.modello, mode: "insensitive" }
    }
    if (filtri.prezzoMin) {
      where.prezzo = {
        ...(where.prezzo as Prisma.FloatFilter),
        gte: filtri.prezzoMin,
      }
    }
    if (filtri.prezzoMax) {
      where.prezzo = {
        ...(where.prezzo as Prisma.FloatFilter),
        lte: filtri.prezzoMax,
      }
    }
    if (filtri.annoDa) {
      where.anno = { gte: filtri.annoDa }
    }
    if (filtri.kmMax) {
      where.km = { lte: filtri.kmMax }
    }
    if (filtri.stato) {
      where.stato = filtri.stato
    } else {
      where.stato = { not: AutoUsataStatusEnum.VENDUTA }
    }

    return this.db.autoUsata.findMany({
      where,
      include: { immagini: true },
      orderBy: { createdAt: "desc" },
    })
  }
}

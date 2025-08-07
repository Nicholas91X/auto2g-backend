import { VenditaRepository } from "../repositories/vendita.repository"
import { AutoUsataRepository } from "../repositories/autoUsata.repository"
import { AccountRepository } from "../../ACCOUNT/repositories/account.repository"
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common"
import { CreateVenditaDto } from "../dtos/createVendita.dto"
import { Prisma, Vendita } from "@prisma/client"
import { AutoUsataStatus } from "@prisma/client"
import { UpdateVenditaDto } from "../dtos/updateVendita.dto"
import { VenditaDto } from "../dtos/vendita.dto"
import { plainToInstance } from "class-transformer"

@Injectable()
export class VenditaService {
  constructor(
    private readonly venditaRepo: VenditaRepository,
    private readonly autoUsataRepo: AutoUsataRepository,
    private readonly accountRepo: AccountRepository,
  ) {}

  async registraVendita(dto: CreateVenditaDto): Promise<Vendita> {
    const auto = await this.autoUsataRepo.findById(dto.autoId)
    if (!auto) throw new NotFoundException("Auto non trovata.")
    if (auto.stato === "VENDUTA")
      throw new ConflictException("Questa auto è già stata venduta.")

    const datiVendita: Prisma.VenditaUncheckedCreateInput = {
      autoId: dto.autoId,
      prezzoFinale: dto.prezzoFinale,
      acquirenteNomeCognome: "",
    }

    if (dto.acquirenteId) {
      const acquirente = await this.accountRepo.findById(dto.acquirenteId)
      if (!acquirente)
        throw new NotFoundException("Account acquirente non trovato.")

      datiVendita.acquirenteId = acquirente.id
      datiVendita.acquirenteNomeCognome = `${acquirente.name} ${acquirente.surname}`
      if (dto.acquirenteInfo) datiVendita.acquirenteInfo = dto.acquirenteInfo
    } else {
      if (!dto.acquirenteNomeCognome) {
        throw new BadRequestException(
          "È necessario specificare o un ID acquirente o il nome e cognome.",
        )
      }
      datiVendita.acquirenteNomeCognome = dto.acquirenteNomeCognome
      if (dto.acquirenteInfo) datiVendita.acquirenteInfo = dto.acquirenteInfo
    }

    const vendita = await this.venditaRepo.create(datiVendita)

    await this.autoUsataRepo.update(dto.autoId, {
      stato: AutoUsataStatus.VENDUTA,
    })

    return vendita
  }

  async findAll(): Promise<VenditaDto[]> {
    const vendite = await this.venditaRepo.findAll()
    return plainToInstance(VenditaDto, vendite, {
      excludeExtraneousValues: true,
    })
  }

  async findOne(id: number): Promise<VenditaDto> {
    const vendita = await this.venditaRepo.findById(id)
    if (!vendita) {
      throw new NotFoundException("Vendita non trovata.")
    }
    return plainToInstance(VenditaDto, vendita, {
      excludeExtraneousValues: true,
    })
  }

  async update(id: number, dto: UpdateVenditaDto): Promise<VenditaDto> {
    await this.findOne(id)
    const vendita = await this.venditaRepo.update(id, dto)
    return this.findOne(vendita.id)
  }

  async remove(id: number): Promise<void> {
    const vendita = await this.venditaRepo.findById(id)
    if (!vendita) {
      throw new NotFoundException("Vendita non trovata.")
    }

    await this.autoUsataRepo.update(vendita.autoId, {
      stato: AutoUsataStatus.DISPONIBILE,
    })

    await this.venditaRepo.remove(id)
  }
}

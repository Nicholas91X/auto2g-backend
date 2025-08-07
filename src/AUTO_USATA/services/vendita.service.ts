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
}

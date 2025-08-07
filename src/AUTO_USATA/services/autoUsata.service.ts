import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { plainToInstance } from "class-transformer"
import {
  DocumentStorageServiceToken,
  type DocumentStorageService,
} from "../../ACCOUNT/services/documentStorage/documentStorage.interface"
import { AutoUsataRepository } from "../repositories/autoUsata.repository"
import { AutoUsataDto } from "../dtos/autoUsata.dto"
import { CreateAutoUsataDto } from "../dtos/createAutoUsata.dto"
import { UpdateAutoUsataDto } from "../dtos/updateAutoUsata.dto"
import { ImmagineAutoRepository } from "../repositories/immagineAuto.repository"

@Injectable()
export class AutoUsataService {
  constructor(
    private readonly autoUsataRepo: AutoUsataRepository,
    private readonly immagineAutoRepo: ImmagineAutoRepository,
    @Inject(DocumentStorageServiceToken)
    private readonly storageService: DocumentStorageService,
  ) {}

  async create(dto: CreateAutoUsataDto): Promise<AutoUsataDto> {
    const auto = await this.autoUsataRepo.create(dto)
    return plainToInstance(AutoUsataDto, auto, {
      excludeExtraneousValues: true,
    })
  }

  async findAll(): Promise<AutoUsataDto[]> {
    const auto = await this.autoUsataRepo.findAll()
    return plainToInstance(AutoUsataDto, auto, {
      excludeExtraneousValues: true,
    })
  }

  async findOne(id: number): Promise<AutoUsataDto> {
    const auto = await this.autoUsataRepo.findById(id)
    if (!auto) {
      throw new NotFoundException("Auto usata non trovata.")
    }
    return plainToInstance(AutoUsataDto, auto, {
      excludeExtraneousValues: true,
    })
  }

  async update(id: number, dto: UpdateAutoUsataDto): Promise<AutoUsataDto> {
    await this.findOne(id)
    const auto = await this.autoUsataRepo.update(id, dto)
    return plainToInstance(AutoUsataDto, auto, {
      excludeExtraneousValues: true,
    })
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id)
    await this.autoUsataRepo.remove(id)
  }

  async uploadImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<AutoUsataDto> {
    const auto = await this.findOne(id);

    const imagePath = await this.storageService.upload(
      file,
      ["auto_usata"],
      `auto-${id}-targa-${auto.targa}`,
    );

    await this.immagineAutoRepo.create(imagePath, id);

    return this.findOne(id);
  }

  async deleteImmagine(autoId: number, immagineId: number): Promise<void> {
    const immagine = await this.immagineAutoRepo.findById(immagineId);

    if (!immagine || immagine.autoUsataId !== autoId) {
      throw new NotFoundException("Immagine non trovata per questa auto.")
    }

    await this.storageService.deleteFile(immagine.url);
    await this.immagineAutoRepo.remove(immagineId);
  }

  async deleteAllImmagini(autoId: number): Promise<void> {
    const auto = await this.autoUsataRepo.findById(autoId);
    if (!auto) {
      throw new NotFoundException("Auto usata non trovata.")
    }

    for (const immagine of auto.immagini) {
      await this.storageService.deleteFile(immagine.url);
    }

    await this.immagineAutoRepo.removeManyByAutoId(autoId);
  }
}

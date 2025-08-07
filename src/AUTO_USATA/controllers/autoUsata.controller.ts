import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"
import { Roles } from "../../ACCOUNT/decorators/roles.decorator"
import { AccountRoleEnum } from "../../ACCOUNT/enums/accountRoleEnum"
import { TokenGuard } from "../../ACCOUNT/guards/token.guard"
import { FileInterceptor } from "@nestjs/platform-express"
import { AutoUsataService } from "../services/autoUsata.service"
import { AutoUsataDto } from "../dtos/autoUsata.dto"
import { CreateAutoUsataDto } from "../dtos/createAutoUsata.dto"
import { UpdateAutoUsataDto } from "../dtos/updateAutoUsata.dto"
import { UpdateAutoUsataStatoDto } from "../dtos/updateAutoUsataStatus.dto"
import { FiltroAutoUsataDto } from "../dtos/filtroAutoUsata.dto"
import { ExcelService } from "../../shared/services/excel.service"
import express from "express"

@ApiTags("Auto Usata")
@Controller("auto-usata")
export class AutoUsataController {
  constructor(
    private readonly autoUsataService: AutoUsataService,
    private readonly excelService: ExcelService,
  ) {}

  @Get("filtered")
  @ApiOperation({
    summary: "Recupera la lista di tutte le auto usate con filtri",
  })
  @ApiResponse({ status: 200, type: [AutoUsataDto] })
  findAllFiltered(
    @Query() filtri: FiltroAutoUsataDto,
  ): Promise<AutoUsataDto[]> {
    return this.autoUsataService.findAllFiltered(filtri)
  }

  @Get()
  @ApiOperation({ summary: "Recupera la lista di tutte le auto usate" })
  @ApiResponse({ status: 200, type: [AutoUsataDto] })
  findAll(): Promise<AutoUsataDto[]> {
    return this.autoUsataService.findAll()
  }

  @Get(":id")
  @ApiOperation({ summary: "Recupera i dettagli di una singola auto usata" })
  @ApiResponse({ status: 200, type: AutoUsataDto })
  @ApiResponse({ status: 404, description: "Auto non trovata" })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<AutoUsataDto> {
    return this.autoUsataService.findOne(id)
  }

  @Post()
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Aggiunge una nuova auto usata (solo Admin/Seller)",
  })
  @ApiResponse({ status: 201, type: AutoUsataDto })
  create(@Body() dto: CreateAutoUsataDto): Promise<AutoUsataDto> {
    return this.autoUsataService.create(dto)
  }

  @Put(":id")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Aggiorna i dati di un'auto usata (solo Admin/Seller)",
  })
  @ApiResponse({ status: 200, type: AutoUsataDto })
  @ApiResponse({ status: 404, description: "Auto non trovata" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAutoUsataDto,
  ): Promise<AutoUsataDto> {
    return this.autoUsataService.update(id, dto)
  }

  @Post(":id/immagine")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @UseInterceptors(FileInterceptor("immagine"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { immagine: { type: "string", format: "binary" } },
    },
  })
  @ApiOperation({
    summary: "Carica l'immagine per un'auto usata (solo Admin/Seller)",
  })
  uploadImage(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.autoUsataService.uploadImage(id, file)
  }

  @Delete(":id")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Rimuove un'auto usata (solo Admin/Seller)" })
  @ApiResponse({ status: 204, description: "Auto rimossa con successo" })
  @ApiResponse({ status: 404, description: "Auto non trovata" })
  remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.autoUsataService.remove(id)
  }

  @Delete(":autoId/immagine/:immagineId")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Rimuove una singola immagine da un'auto usata" })
  @ApiResponse({ status: 204, description: "Immagine rimossa con successo" })
  deleteImmagine(
    @Param("autoId", ParseIntPipe) autoId: number,
    @Param("immagineId", ParseIntPipe) immagineId: number,
  ): Promise<void> {
    return this.autoUsataService.deleteImmagine(autoId, immagineId)
  }

  @Delete(":id/immagine")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Rimuove TUTTE le immagini da un'auto usata" })
  @ApiResponse({
    status: 204,
    description: "Tutte le immagini sono state rimosse",
  })
  deleteAllImmagini(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.autoUsataService.deleteAllImmagini(id)
  }

  @Patch(":id/stato")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Aggiorna lo stato di un'auto usata (solo Admin/Seller)",
  })
  @ApiResponse({ status: 200, type: AutoUsataDto })
  @ApiResponse({ status: 404, description: "Auto non trovata" })
  updateStato(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAutoUsataStatoDto,
  ): Promise<AutoUsataDto> {
    return this.autoUsataService.updateStato(id, dto)
  }

  @Patch(":id/toggle-vetrina")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: 'Attiva/disattiva lo stato "In Vetrina" di un\'auto',
  })
  @ApiResponse({ status: 200, type: AutoUsataDto })
  toggleVetrina(@Param("id", ParseIntPipe) id: number): Promise<AutoUsataDto> {
    return this.autoUsataService.toggleFlag(id, "inVetrina")
  }

  @Patch(":id/toggle-pubblicazione")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Pubblica/nascondi un'auto" })
  @ApiResponse({ status: 200, type: AutoUsataDto })
  togglePubblicazione(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<AutoUsataDto> {
    return this.autoUsataService.toggleFlag(id, "pubblicata")
  }

  @Get("export/excel")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @Header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  @Header(
    "Content-Disposition",
    'attachment; filename="report-auto-usate.xlsx"',
  )
  @ApiOperation({
    summary: "Esporta la lista delle auto usate in formato Excel",
  })
  async exportToExcel(
    @Query() filtri: FiltroAutoUsataDto,
    @Res() res: express.Response,
  ) {
    const autoList = await this.autoUsataService.findAllFiltered(filtri)

    const headers = [
      { header: "ID", key: "id", width: 10 },
      { header: "Marca", key: "marca", width: 20 },
      { header: "Modello", key: "modello", width: 20 },
      { header: "Targa", key: "targa", width: 15 },
      { header: "Anno", key: "anno", width: 10 },
      { header: "Prezzo Vendita", key: "prezzo", width: 15 },
      { header: "Km", key: "km", width: 15 },
      { header: "Stato", key: "stato", width: 15 },
      { header: "Carburante", key: "carburante", width: 15 },
      { header: "Cilindrata", key: "cilindrata", width: 15 },
      { header: "Potenza (CV)", key: "potenzaCV", width: 15 },
      { header: "Cambio", key: "tipoDiCambio", width: 15 },
      { header: "Trazione", key: "trazione", width: 20 },
      { header: "Classe Emissione", key: "classeEmissione", width: 20 },
      { header: "Colore", key: "coloreEsterno", width: 20 },
      { header: "Numero Porte", key: "numeroPorte", width: 2 },
      { header: "Numero Posti", key: "numeroPosti", width: 2 },
      { header: "Note optional", key: "noteOptional", width: 50 },
      { header: "ABS", key: "abs", width: 5 },
      { header: "Airbags", key: "airbag", width: 5 },
      { header: "Climatizzatore", key: "climatizzatore", width: 5 },
      { header: "Servo Sterzo", key: "servosterzo", width: 5 },
      { header: "Navigatore", key: "navigatore", width: 5 },
      { header: "Sensori Parcheggio", key: "sensoriParcheggio", width: 5 },
      { header: "Cruise Control", key: "cruiseControl", width: 5 },
      { header: "Interni in pelle", key: "interniInPelle", width: 5 },
      { header: "Cerchi in lega", key: "cerchiInLega", width: 5 },
      { header: "Vetrina", key: "inVetrina", width: 5 },
      { header: "Pubblicata", key: "pubblicata", width: 5 },
      { header: "Descrizione", key: "descrizione", width: 50 },
    ]

    const buffer = await this.excelService.createExcel(
      headers,
      autoList,
      "Auto Usate",
    )
    res.send(buffer)
  }
}

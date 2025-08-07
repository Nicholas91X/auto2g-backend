import {
  Body,
  Controller,
  Delete,
  Get, Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put, Res,
  UseGuards,
} from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { VenditaService } from "../services/vendita.service"
import { Roles } from "../../ACCOUNT/decorators/roles.decorator"
import { AccountRoleEnum } from "../../ACCOUNT/enums/accountRoleEnum"
import { TokenGuard } from "../../ACCOUNT/guards/token.guard"
import { CreateVenditaDto } from "../dtos/createVendita.dto"
import { UpdateVenditaDto } from "../dtos/updateVendita.dto"
import { VenditaDto } from "../dtos/vendita.dto"
import { ExcelService } from "../../shared/services/excel.service"
import express from "express"

@ApiTags("Vendite")
@Controller("vendite")
export class VenditaController {
  constructor(
    private readonly venditaService: VenditaService,
    private readonly excelService: ExcelService,
  ) {}

  @Post()
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Registra una nuova vendita (solo Admin/Seller)" })
  registraVendita(@Body() dto: CreateVenditaDto) {
    return this.venditaService.registraVendita(dto)
  }

  @Get()
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Recupera la lista di tutte le vendite" })
  findAll(): Promise<VenditaDto[]> {
    return this.venditaService.findAll()
  }

  @Get(":id")
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Recupera i dettagli di una singola vendita" })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<VenditaDto> {
    return this.venditaService.findOne(id)
  }

  @Put(":id")
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "Aggiorna i dati di una vendita" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateVenditaDto,
  ): Promise<VenditaDto> {
    return this.venditaService.update(id, dto)
  }

  @Delete(":id")
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Cancella una vendita (ripristina lo stato dell'auto)",
  })
  remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.venditaService.remove(id)
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
  @Header("Content-Disposition", 'attachment; filename="report-vendite.xlsx"')
  @ApiOperation({
    summary: "Esporta la lista delle auto vendute in formato Excel",
  })
  async exportVenditeToExcel(@Res() res: express.Response) {
    const venditeList = await this.venditaService.findAll()

    const dataForExcel = venditeList.map((v) => ({
      dataVendita: v.dataVendita,
      prezzoFinale: v.prezzoFinale,
      acquirente: v.acquirenteNomeCognome,
      marca: v.auto.marca,
      modello: v.auto.modello,
      targa: v.auto.targa,
      anno: v.auto.anno,
    }))

    const headers = [
      { header: "Data Vendita", key: "dataVendita", width: 20 },
      { header: "Prezzo Finale", key: "prezzoFinale", width: 15 },
      { header: "Acquirente", key: "acquirente", width: 30 },
      { header: "Marca Veicolo", key: "marca", width: 20 },
      { header: "Modello Veicolo", key: "modello", width: 20 },
      { header: "Targa Veicolo", key: "targa", width: 15 },
      { header: "Anno Veicolo", key: "anno", width: 10 },
    ]

    const buffer = await this.excelService.createExcel(
      headers,
      dataForExcel,
      "Vendite",
    )
    res.send(buffer)
  }
}

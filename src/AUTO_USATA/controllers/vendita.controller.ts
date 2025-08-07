import {
  Body,
  Controller,
  Delete, Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
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

@ApiTags("Vendite")
@Controller("vendite")
export class VenditaController {
  constructor(private readonly venditaService: VenditaService) {}

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
}

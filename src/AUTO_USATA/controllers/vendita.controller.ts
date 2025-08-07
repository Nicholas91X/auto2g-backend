import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { VenditaService } from "../services/vendita.service"
import { Roles } from "../../ACCOUNT/decorators/roles.decorator"
import { AccountRoleEnum } from "../../ACCOUNT/enums/accountRoleEnum"
import { TokenGuard } from "../../ACCOUNT/guards/token.guard"
import { CreateVenditaDto } from "../dtos/createVendita.dto"

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
}

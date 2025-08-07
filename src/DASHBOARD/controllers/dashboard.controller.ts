import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { AccountRoleEnum } from "../../ACCOUNT/enums/accountRoleEnum"
import { Roles } from "../../ACCOUNT/decorators/roles.decorator"
import { TokenGuard } from "../../ACCOUNT/guards/token.guard"
import { DashboardService } from "../services/dashboard.service"

@ApiTags("Dashboard")
@Controller("dashboard")
@UseGuards(TokenGuard)
@ApiBearerAuth("bearer")
@Roles(
  AccountRoleEnum.SYSTEM_ADMIN,
  AccountRoleEnum.ADMIN,
  AccountRoleEnum.SELLER,
)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  @ApiOperation({ summary: "Recupera i dati di riepilogo per la dashboard" })
  getSummary() {
    return this.dashboardService.getSummary()
  }

  @Get("summary/performance-marca")
  @ApiOperation({ summary: "Recupera le performance di vendita per marca" })
  getPerformancePerMarca() {
    return this.dashboardService.getPerformancePerMarca()
  }

  @Get("summary/attivita-recente")
  @ApiOperation({
    summary: "Recupera le ultime auto aggiunte e le ultime vendite",
  })
  getAttivitaRecente() {
    return this.dashboardService.getAttivitaRecente()
  }
}

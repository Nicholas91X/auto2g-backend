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
}

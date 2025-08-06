import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common"
import { AuthService } from "../services/auth.service"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { AccountLoginDto } from "../dtos/accountLogin.dto"

@ApiTags("Login")
@Controller("/login")
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Autentica un customer account registrato e restituisce un JWT token
   */
  @Post("customer")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Account login" })
  @ApiResponse({ status: 200, description: "JWT token returned." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async login(@Body() dto: AccountLoginDto) {
    const result = await this.authService.login(dto.email, dto.password)
    return { result }
  }
}
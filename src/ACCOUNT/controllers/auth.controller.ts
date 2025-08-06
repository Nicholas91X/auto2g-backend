import {
  BadRequestException, Body,
  Controller,
  Get, HttpCode,
  HttpStatus,
  Logger, Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger"

import { AuthService } from "../services/auth.service"
import AccountService from "../services/account.service"
import { ResetPasswordDto } from '../dtos/resetPassword.dto';
import { RequestPasswordResetDto } from '../dtos/requestPasswordReset.dto';

/**
 * Controller per la gestione dell'autenticazione.
 * Include la verifica email e l'integrazione con OAuth (Google).
 */
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  // ---
  // ## Verifica Email
  // ---

  /**
   * Verifica l'email di un utente utilizzando un token JWT ricevuto via email.
   * In caso di successo, l'API potrebbe reindirizzare l'utente a una pagina di login o conferma sul frontend.
   *
   * @param token Il token di verifica dalla stringa di query.
   * @returns Un oggetto con un messaggio di successo e i risultati della verifica.
   * @throws BadRequestException Se il token non è fornito o non è valido.
   */
  @Get("/verify")
  @ApiOperation({ summary: "Verifica email tramite token di conferma" })
  @ApiQuery({
    name: "token",
    required: true,
    description: "Token di verifica ricevuto via email",
  })
  @ApiResponse({ status: 200, description: "Email verificata con successo." })
  @ApiResponse({
    status: 400,
    description: "Token di verifica mancante o non valido.",
  })
  async verify(@Query("token") token: string) {
    if (!token?.trim()) {
      throw new BadRequestException("Il token di verifica è richiesto.")
    }

    try {
      const result = await this.authService.verifyUser(token)

      this.logger.log(
        `Email verificata con successo per l'utente con email: ${result.email}`,
      )
      return {
        message: "Email verificata con successo.",
        result,
      }
    } catch (error) {
      this.logger.error("Errore durante la verifica dell'utente", error)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException("Verifica fallita: " + error.message)
    }
  }

  /**
   * Richiede un link per il reset della password per un dato indirizzo email.
   * Se un account con l'email fornita esiste, verrà inviata un'email con le istruzioni di reset.
   * Questo endpoint è pubblico e non rivela l'esistenza dell'utente per motivi di sicurezza.
   * @param dto Dati per la richiesta di reset password.
   * @returns Messaggio di conferma.
   */
  @Post("/password/request-reset")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Richiedi reset password (pubblico)" })
  @ApiResponse({
    status: 200,
    description: "Email inviata se l'account esiste",
  })
  @ApiResponse({
    status: 400,
    description: "Richiesta non valida (es. email non fornita)",
  })
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    try {
      await this.authService.sendPasswordResetToken(dto.email)
      return {
        message:
          "Se un account con questa email esiste, riceverai presto istruzioni.",
      }
    } catch (error) {
      this.logger.error("Errore durante la richiesta di reset password", error)
      return {
        message:
          "Se un account con questa email esiste, riceverai presto istruzioni.",
      }
    }
  }

  /**
   * Resetta la password di un utente utilizzando il token ricevuto via email.
   * @param dto Dati per il reset della password (token e nuova password).
   * @returns Messaggio di successo o errore in caso di fallimento.
   */
  @Post("/password/reset")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password tramite token (pubblico)" })
  @ApiResponse({ status: 200, description: "Password resettata con successo" })
  @ApiResponse({ status: 400, description: "Token non valido o scaduto" })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      await this.authService.resetPassword(dto.token, dto.newPassword)
      return { message: "Password aggiornata con successo." }
    } catch (error) {
      this.logger.error("Errore durante il reset della password", error)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException("Token non valido o scaduto.")
    }
  }
}
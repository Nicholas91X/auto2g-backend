import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode, HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import {
  ApiBearerAuth, ApiBody, ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"
import type { Request, Response } from "express"
import { plainToInstance } from "class-transformer"
import { Account, AccountRole } from "@prisma/client"

import { UpdateEmailDto } from "../dtos/updateEmail.dto"
import { UpdatePasswordDto } from "../dtos/updatePassword.dto"
import { AccountInfoDto } from "../dtos/accountInfo.dto"
import { UpdateAccountProfileDto } from "../dtos/updateAccountProfile.dto"
import { FilterByActiveDto } from "../dtos/filterByActive.dto"
import { FilterByVerifiedDto } from "../dtos/filterByVerified.dto"
import { ToggleActiveDto } from "../dtos/toggleActive.dto"

import AccountService from "../services/account.service"

import { TokenGuard } from "../guards/token.guard"
import { Roles } from "../decorators/roles.decorator"
import { FileInterceptor } from "@nestjs/platform-express"
import { AccountRoleEnum } from "../enums/accountRoleEnum"
import { CreateAccountDto } from "../dtos/createAccount.dto"
import { CreateAccountAdminDto } from "../dtos/createAccountAdmin.dto"

/**
 * Controller per la gestione degli account utente.
 * Le route richiedono autenticazione tramite Bearer token e sono protette da TokenGuard.
 */
@ApiTags("Account")
@Controller("account")
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
  ) {}

  // ---
  // ## Gestione Profilo Utente (Accesso Personale)
  // ---

  /**
   * Crea un nuovo account utente.
   * Endpoint pubblico utilizzato per la registrazione classica via email/password.
   * @param req
   * @param dto Dati per la creazione dell'account.
   * @returns I dati dell'account appena creato.
   * (TESTATO)
   */
  @Post("account")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Crea un nuovo account utente (pubblico)" })
  @ApiResponse({
    status: 201,
    description: "Restituisce l'account appena creato",
  })
  @ApiResponse({ status: 400, description: "Dati di input non validi" })
  async createAccount(
    @Req() req: Request,
    @Body() dto: CreateAccountDto,
  ): Promise<AccountInfoDto> {
    return this.accountService.createAccount(dto)
  }

  /**
   * Crea un nuovo account amministratore (o con ruolo elevato).
   * Accessibile solo dagli utenti con ruolo ADMIN o SYSTEM_ADMIN.
   * @param dto Dati per la creazione dell'account amministratore.
   * @returns I dati dell'account amministratore creato.
   */
  @UseGuards(TokenGuard)
  @Roles(AccountRole.ADMIN, AccountRole.SYSTEM_ADMIN)
  @ApiBearerAuth("bearer")
  @Post("account/admin")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Crea un nuovo account amministratore (solo admin)",
  })
  @ApiResponse({
    status: 201,
    description: "Restituisce l'account amministratore appena creato",
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description: "Accesso negato (ruolo insufficiente)",
  })
  @ApiResponse({ status: 400, description: "Dati di input non validi" })
  async createAdmin(
    @Body() dto: CreateAccountAdminDto,
  ): Promise<AccountInfoDto> {
    return this.accountService.createAccountAdmin(dto)
  }

  /**
   * Recupera il profilo dell'utente autenticato.
   * @param req La richiesta contenente l'oggetto utente autenticato.
   * @returns Il DTO con le informazioni del profilo dell'account.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Get("profile")
  @Roles(
    AccountRoleEnum.CUSTOMER,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiOperation({ summary: "Recupera il profilo dell'utente autenticato" })
  @ApiResponse({
    status: 200,
    description: "Profilo utente recuperato con successo",
    type: AccountInfoDto,
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  async getProfile(@Req() req: Request): Promise<AccountInfoDto> {
    const user: Account = req.user as Account
    return plainToInstance(AccountInfoDto, user, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * Aggiorna il nome e il cognome del profilo dell'utente autenticato.
   * @param req La richiesta contenente l'oggetto utente autenticato.
   * @param dto DTO con nome e cognome aggiornati.
   * @returns Il DTO con le informazioni aggiornate del profilo dell'account.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Put("profile")
  @Roles(
    AccountRoleEnum.CUSTOMER,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiOperation({ summary: "Aggiorna nome e cognome del profilo autenticato" })
  @ApiResponse({
    status: 200,
    description: "Nome e cognome aggiornati con successo",
    type: AccountInfoDto,
  })
  @ApiResponse({ status: 400, description: "Dati di input non validi" })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateAccountProfileDto,
  ): Promise<AccountInfoDto> {
    const userId = (req.user as Account).id
    return this.accountService.updateProfile(userId, dto)
  }

  /**
   * Aggiorna l'email del profilo dell'utente autenticato.
   * @param req La richiesta contenente l'oggetto utente autenticato.
   * @param dto DTO con la nuova email.
   * @returns Il DTO con le informazioni aggiornate del profilo dell'account.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Put("profile/email")
  @Roles(
    AccountRoleEnum.CUSTOMER,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiOperation({ summary: "Aggiorna email del profilo autenticato" })
  @ApiResponse({
    status: 200,
    description: "Email aggiornata con successo",
    type: AccountInfoDto,
  })
  @ApiResponse({
    status: 400,
    description: "Email già in uso o dati non validi",
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  async updateEmail(
    @Req() req: Request,
    @Body() dto: UpdateEmailDto,
  ): Promise<AccountInfoDto> {
    const userId = (req.user as Account).id
    return this.accountService.updateEmail(userId, dto)
  }

  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Put('profile-picture')
  @UseInterceptors(FileInterceptor('document'))
  @Roles(AccountRoleEnum.SELLER, AccountRoleEnum.CUSTOMER, AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Carica la foto profilo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { document: { type: 'string', format: 'binary' } } } })
  async uploadProfilePicture(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const user = (req.user as Account)
    if (!file) throw new BadRequestException('File del documento mancante.');
    return this.accountService.uploadProfilePicture(user.id, file);
  }

  /**
   * Aggiorna la password del profilo dell'utente autenticato.
   * Nota: Questo endpoint è per gli utenti *autenticati* che vogliono cambiare la propria password.
   * Per il reset password con token, si usa RegistrationController.
   * @param req La richiesta contenente l'oggetto utente autenticato.
   * @param dto DTO con la vecchia e la nuova password.
   * @returns Il DTO con le informazioni aggiornate del profilo dell'account.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Put("profile/password")
  @Roles(
    AccountRoleEnum.CUSTOMER,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiOperation({ summary: "Aggiorna password del profilo autenticato" })
  @ApiResponse({
    status: 200,
    description: "Password aggiornata con successo",
    type: AccountInfoDto,
  })
  @ApiResponse({
    status: 400,
    description: "Vecchia password non corretta o dati non validi",
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  async updatePassword(
    @Req() req: Request,
    @Body() dto: UpdatePasswordDto,
  ): Promise<AccountInfoDto> {
    const userId = (req.user as Account).id
    return this.accountService.updatePassword(userId, dto)
  }

  /**
   * Elimina l'account dell'utente autenticato (cancellazione logica).
   * @param req La richiesta contenente l'oggetto utente autenticato.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Delete("profile")
  @Roles(
    AccountRoleEnum.CUSTOMER,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiOperation({
    summary: "Elimina l’account autenticato (cancellazione logica)",
  })
  @ApiResponse({ status: 200, description: "Account eliminato con successo" })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description:
      "Non puoi eliminare il tuo stesso account se sei l'unico admin (se applicabile)",
  })
  async deleteProfile(@Req() req: Request): Promise<void> {
    const user = req.user as Account
    await this.accountService.deleteAccountProfile(user)
  }

  // ---
  // ## Gestione Account (Accesso Admin)
  // ---

  /**
   * Elenca tutti gli account nel sistema (solo per admin/system_admin).
   * @returns Un array di DTO con le informazioni di tutti gli account.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Get()
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Elenca tutti gli account (solo admin)" })
  @ApiResponse({
    status: 200,
    description: "Lista di tutti gli account recuperata con successo",
    type: [AccountInfoDto],
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description: "Accesso negato (ruolo insufficiente)",
  })
  async listAll(): Promise<AccountInfoDto[]> {
    return this.accountService.listAll()
  }

  /**
   * Cerca account per query (solo per admin/system_admin).
   * La ricerca avviene su nome, cognome ed email.
   * @param query La stringa di ricerca.
   * @returns Un array di DTO con gli account corrispondenti.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Get("search")
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Cerca account per query (solo admin)" })
  @ApiQuery({
    name: "query",
    required: true,
    description: "Stringa di ricerca per nome, cognome o email",
  })
  @ApiResponse({
    status: 200,
    description: "Risultati della ricerca account",
    type: [AccountInfoDto],
  })
  @ApiResponse({
    status: 400,
    description: "La query di ricerca è obbligatoria",
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description: "Accesso negato (ruolo insufficiente)",
  })
  async search(@Query("query") query: string): Promise<AccountInfoDto[]> {
    if (!query || query.trim() === "") {
      throw new BadRequestException("La query di ricerca è obbligatoria.")
    }
    return this.accountService.searchAccounts(query)
  }

  /**
   * Recupera i dettagli di un account specifico tramite ID (solo per admin/system_admin).
   * @param id L'ID dell'account da recuperare.
   * @returns Il DTO con le informazioni dell'account.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Get(":id")
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Recupera profilo account per ID (solo admin)" })
  @ApiParam({ name: "id", type: Number, description: "ID dell'account" })
  @ApiResponse({
    status: 200,
    description: "Profilo account recuperato con successo",
    type: AccountInfoDto,
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description: "Accesso negato (ruolo insufficiente)",
  })
  @ApiResponse({ status: 404, description: "Account non trovato" })
  async getById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<AccountInfoDto> {
    return this.accountService.getAccountInfo(id)
  }

  /**
   * Elenca account per ruolo (solo per admin/system_admin).
   * @param role Il ruolo per cui filtrare gli account.
   * @returns Un array di DTO con gli account del ruolo specificato.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Get("role/:role")
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Elenca account per ruolo (solo admin)" })
  @ApiParam({
    name: "role",
    enum: AccountRoleEnum,
    description: "Ruolo dell'account",
  })
  @ApiResponse({
    status: 200,
    description: "Lista di account per ruolo recuperata con successo",
    type: [AccountInfoDto],
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description: "Accesso negato (ruolo insufficiente)",
  })
  @ApiResponse({ status: 400, description: "Ruolo non valido" })
  async listByRole(
    @Param("role") role: AccountRole,
  ): Promise<AccountInfoDto[]> {
    return this.accountService.listByRole(role)
  }

  /**
   * Elenca account filtrati per stato "attivo" (solo per admin/system_admin).
   * @param query DTO con il flag "active" (true/false).
   * @returns Un array di DTO con gli account filtrati per stato attivo.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Get("active")
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Elenca account per stato "attivo" (solo admin)' })
  @ApiQuery({
    name: "active",
    type: Boolean,
    description: "Filtra per stato attivo (true/false)",
  })
  @ApiResponse({
    status: 200,
    description:
      "Lista di account filtrati per stato attivo recuperata con successo",
    type: [AccountInfoDto],
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description: "Accesso negato (ruolo insufficiente)",
  })
  @ApiResponse({ status: 400, description: 'Valore per "active" non valido' })
  async listByActive(
    @Query() query: FilterByActiveDto,
  ): Promise<AccountInfoDto[]> {
    return this.accountService.listByActive(query.active)
  }

  /**
   * Elenca account filtrati per stato "verificato" (solo per admin/system_admin).
   * @param query DTO con il flag "verified" (true/false).
   * @returns Un array di DTO con gli account filtrati per stato verificato.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Get("verified")
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Elenca account per stato "verificato" (solo admin)',
  })
  @ApiQuery({
    name: "verified",
    type: Boolean,
    description: "Filtra per stato verificato (true/false)",
  })
  @ApiResponse({
    status: 200,
    description:
      "Lista di account filtrati per stato verificato recuperata con successo",
    type: [AccountInfoDto],
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description: "Accesso negato (ruolo insufficiente)",
  })
  @ApiResponse({ status: 400, description: 'Valore per "verified" non valido' })
  async listByVerified(
    @Query() query: FilterByVerifiedDto,
  ): Promise<AccountInfoDto[]> {
    return this.accountService.listByVerified(query.verified)
  }

  /**
   * Aggiorna il profilo di un account specifico tramite ID (solo per admin/system_admin).
   * @param id L'ID dell'account da aggiornare.
   * @param dto DTO con i dati del profilo da aggiornare.
   * @returns Il DTO con le informazioni aggiornate dell'account.
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Put(":id")
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Aggiorna profilo account per ID (solo admin)" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID dell'account da aggiornare",
  })
  @ApiResponse({
    status: 200,
    description: "Profilo account aggiornato con successo",
    type: AccountInfoDto,
  })
  @ApiResponse({ status: 400, description: "Dati di input non validi" })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description: "Accesso negato (ruolo insufficiente)",
  })
  @ApiResponse({ status: 404, description: "Account non trovato" })
  async updateById(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAccountProfileDto,
  ): Promise<AccountInfoDto> {
    return this.accountService.updateProfile(id, dto)
  }

  /**
   * Abilita o disabilita un account specifico (cambia lo stato 'active' a true/false) (solo per admin/system_admin).
   * @param id L'ID dell'account da aggiornare.
   * @param dto DTO con il flag 'active' (true/false).
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Put(":id/active")
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Abilita o disabilita un account (solo admin)" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID dell'account da aggiornare",
  })
  @ApiResponse({
    status: 204,
    description: "Stato dell'account aggiornato con successo",
  })
  @ApiResponse({
    status: 400,
    description:
      "Impossibile disabilitare l'ultimo amministratore attivo o dati non validi",
  })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description: "Accesso negato (ruolo insufficiente)",
  })
  @ApiResponse({ status: 404, description: "Account non trovato" })
  async toggleAccountActive(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ToggleActiveDto,
  ): Promise<void> {
    await this.accountService.adminToggleActive(id, dto.active)
  }

  /**
   * Elimina un account specifico tramite ID (cancellazione logica, solo per admin/system_admin).
   * @param id L'ID dell'account da eliminare.
   * @param req La richiesta contenente l'oggetto utente autenticato (per i controlli di sicurezza).
   */
  @ApiBearerAuth("bearer")
  @UseGuards(TokenGuard)
  @Delete(":id")
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN)
  @ApiOperation({ summary: "Elimina account per ID (solo admin)" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID dell'account da eliminare",
  })
  @ApiResponse({ status: 200, description: "Account eliminato con successo" })
  @ApiResponse({ status: 401, description: "Non autorizzato" })
  @ApiResponse({
    status: 403,
    description:
      "Accesso negato (non puoi eliminare te stesso o l'unico admin)",
  })
  @ApiResponse({ status: 404, description: "Account non trovato" })
  async deleteById(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<void> {
    const actingUser = req.user as Account
    await this.accountService.deleteAccount(id, actingUser)
  }

  /**
   * Restituisce l'URL pubblico della foto profilo di un utente.
   * Utile per il frontend per ottenere il link da mostrare in un tag <img>.
   */
  @Get(':id/profile-picture-url')
  @Roles(AccountRoleEnum.ADMIN, AccountRoleEnum.SYSTEM_ADMIN, AccountRoleEnum.SELLER, AccountRoleEnum.CUSTOMER)
  @ApiOperation({ summary: 'Recupera l\'URL pubblico della foto profilo di un utente' })
  async getProfilePictureUrl(
    @Param('id', ParseIntPipe) accountId: number,
  ): Promise<{ url: string | null }> {
    const account = await this.accountService.getAccountInfo(accountId);
    const url = this.accountService.getPublicProfilePictureUrl(account as Account);

    return { url };
  }


  /**
   * Restituisce l'URL pubblico della foto profilo di un utente.
   * Utile per il frontend per ottenere il link da mostrare in un tag <img>.
   */
  @Get(':id/profile-picture')
  @ApiOperation({ summary: 'Recupera una foto profilo pubblica tramite ID account' })
  @ApiResponse({ status: 200, description: 'L\'immagine del profilo viene inviata.' })
  @ApiResponse({ status: 404, description: 'Foto profilo o account non trovato.' })
  async getProfilePicture(
    @Param('id', ParseIntPipe) accountId: number,
    @Res() res: Response,
  ) {

    const { fileStream, filename, mimetype } = await this.accountService.getProfilePictureStream(accountId);

    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    fileStream.pipe(res);
  }
}
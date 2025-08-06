import {
  BadRequestException, ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common"
import { Account, AccountRole } from "@prisma/client"

import { AccountRepository } from "../repositories/account.repository"

import { AccountInfoDto } from "../dtos/accountInfo.dto"
import { UpdateAccountProfileDto } from "../dtos/updateAccountProfile.dto"
import { UpdatePasswordDto } from "../dtos/updatePassword.dto"
import { UpdateEmailDto } from "../dtos/updateEmail.dto"
import { CreateAccountDto } from "../dtos/createAccount.dto"
import { CreateAccountAdminDto } from "../dtos/createAccountAdmin.dto"
import { AuthService } from "./auth.service"
import { type IEmailService, IEmailServiceToken } from "../../EMAIL/interfaces/email-service.interface"
import { EncryptUtils } from "../../utils/encrypt.utils"
import { type DocumentStorageService, DocumentStorageServiceToken } from "./documentStorage/documentStorage.interface"
import { ConfigService } from "@nestjs/config"
import * as fs from 'fs';
import * as path from 'path';
import { CreateSellerDto } from '../dtos/createSeller.dto';

type AnyCreationDto = CreateAccountDto | CreateAccountAdminDto;

/**
 * Servizio per la gestione delle operazioni relative agli account utente.
 * Include logiche di creazione, recupero, aggiornamento e cancellazione,
 * oltre a funzionalità specifiche per admin e integrazione OAuth.
 */
@Injectable()
export default class AccountService {
  private readonly logger = new Logger(AccountService.name)
  private readonly baseApiUrl: string;
  private readonly baseUploadDir = path.resolve(process.cwd(), 'uploads');

  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @Inject(IEmailServiceToken)
    private readonly emailService: IEmailService,
    @Inject(DocumentStorageServiceToken) private readonly storageService: DocumentStorageService,
  ) {
    this.baseApiUrl = this.configService.get<string>("BACKEND_BASE_URL", "https://auto2g.it");
  }

  // ---
  // ## Gestione Account Standard
  // ---

  /**
   * Costruisce l'URL pubblico completo per la foto profilo di un utente.
   * @param account L'oggetto Account dal database.
   * @returns L'URL completo dell'immagine, o null se non ne ha una.
   */
  getPublicProfilePictureUrl(account: Account): string | null {
    if (!account?.profilePicture) {
      return null;
    }
    return `${this.baseApiUrl}/public/${account.profilePicture}`;
  }

  /**
   * Recupera il percorso della foto profilo di un utente dal DB e restituisce
   * uno stream leggibile del file fisico, insieme ai suoi metadati.
   */
  async getProfilePictureStream(
    accountId: number,
  ): Promise<{ fileStream: fs.ReadStream; filename: string; mimetype: string }> {

    const account = await this.accountRepo.findById(accountId);
    if (!account?.profilePicture) {
      throw new NotFoundException(`Foto profilo non trovata per l'account con ID ${accountId}.`);
    }

    const relativePath = account.profilePicture;
    const absolutePath = path.join(this.baseUploadDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
      this.logger.error(`File non trovato su disco (${absolutePath}) anche se presente nel DB per l'account ${accountId}.`);
      throw new NotFoundException('Il file della foto profilo non è più disponibile sul server.');
    }

    const filename = path.basename(absolutePath);
    const mimetype = this.getMimeType(filename);
    const fileStream = fs.createReadStream(absolutePath);

    return { fileStream, filename, mimetype };
  }

  private getMimeType(filename: string): string {
    const extension = path.extname(filename).toLowerCase();
    switch (extension) {
      case '.jpg': case '.jpeg': return 'image/jpeg';
      case '.png': return 'image/png';
      case '.gif': return 'image/gif';
      default: return 'application/octet-stream';
    }
  }

  /**
   * Crea un nuovo account utente con ruolo CUSTOMER.
   */
  async createAccount(dto: CreateAccountDto): Promise<AccountInfoDto> {
    await this._validateCreationPrerequisites(dto);

    try {
      const encryptedPassword = await EncryptUtils.encrypt(dto.password);

      const newAccount = await this.accountRepo.createAccount({
        email: dto.email,
        name: dto.name,
        surname: dto.surname,
        phoneNumber: dto.phoneNumber,
        password: encryptedPassword,
        role: AccountRole.CUSTOMER,
        profilePicture: null
      });

      const isCustomer = newAccount.role === AccountRole.CUSTOMER;
      const verificationToken = await this.authService.generateRegistrationConfirmToken(newAccount);
      try {
        this.logger.log(`Tentativo di invio mail di conferma per account ${newAccount.id}`);
        await this.emailService.sendVerificationEmail(dto.email, verificationToken, isCustomer);
        this.logger.log(`Invio mail di conferma per account ${newAccount.id} avvenuto con successo`);
      } catch (error) {
        this.logger.error(`Errore durante l'invio mail di conferma per account ${newAccount.id}`, error.stack);
      }

      this.logger.log(`Account CUSTOMER creato con ID: ${newAccount.id}.`);
      return this.mapToAccountInfoDto(newAccount);

    } catch (error) {
      this.logger.error("Errore durante la creazione dell'account CUSTOMER", error.stack);
      throw new InternalServerErrorException("Impossibile creare l'account.");
    }
  }

  /**
   * Crea un nuovo account utente con ruolo DRIVER.
   */
  async createAccountDriver(dto: CreateSellerDto, encryptedPassword: string, profilePicturePath: string | null): Promise<Account> {
    await this._validateCreationPrerequisites(dto);

    try {
      const newAccount = await this.accountRepo.createAccount({
        email: dto.email,
        name: dto.name,
        surname: dto.surname,
        phoneNumber: dto.phoneNumber,
        password: encryptedPassword,
        role: AccountRole.SELLER,
        profilePicture: profilePicturePath,
      });

      this.logger.log(`Account SELLER creato con ID: ${newAccount.id}.`);
      return newAccount;

    } catch (error) {
      this.logger.error("Errore durante la creazione dell'account SELLER", error.stack);
      throw new InternalServerErrorException("Impossibile creare l'account.");
    }
  }

  /**
   * Crea un nuovo account amministrativo.
   */
  async createAccountAdmin(dto: CreateAccountAdminDto): Promise<AccountInfoDto> {
    await this._validateCreationPrerequisites(dto)

    try {
      const { tempPw, encryptedPw } = await EncryptUtils.generateTempEncryptedPassword();

      const newAdminAccount = await this.accountRepo.createAccount({
        email: dto.email,
        name: dto.name,
        surname: dto.surname,
        phoneNumber: dto.phoneNumber,
        password: encryptedPw,
        role: AccountRole.ADMIN,
        profilePicture: null
      });

      const verificationToken = await this.authService.generateRegistrationConfirmToken(newAdminAccount);
      await this.emailService.sendAdminAccountSetup(dto.email, tempPw, verificationToken);

      this.logger.log(`Account ADMIN creato con ID: ${newAdminAccount.id}.`);
      return this.mapToAccountInfoDto(newAdminAccount);
    } catch (error) {
      this.logger.error("Errore durante la creazione dell'account ADMIN", error.stack);
      throw new InternalServerErrorException("Impossibile creare l'account amministratore.");
    }
  }

  // --- Metodi Helper Privati ---

  /**
   * Esegue i controlli preliminari comuni a tutte le creazioni di account.
   * @param dto Il DTO di creazione contenente email e consensi.
   */
  private async _validateCreationPrerequisites(dto: AnyCreationDto): Promise<void> {
    const existingAccount = await this.accountRepo.findByEmail(dto.email);
    if (existingAccount) {
      this.logger.error(`Un account con l'email '${dto.email}' esiste già.`)
      throw new ConflictException(`Un account con l'email '${dto.email}' esiste già.`);
    }
  }

  /**
   * Recupera le informazioni pubbliche di un account tramite il suo ID.
   * Tipicamente utilizzato da admin o per visualizzare profili pubblici.
   *
   * @param id L'ID dell'account da recuperare.
   * @returns AccountInfoDto - Le informazioni pubbliche del profilo dell'account.
   * @throws NotFoundException Se l'account non viene trovato.
   */
  async getAccountInfo(id: number): Promise<AccountInfoDto> {
    const account = await this.accountRepo.findById(id)
    if (!account) {
      this.logger.error(`Account ${id} non trovato.`)
      throw new NotFoundException("Account non trovato.")
    }
    return this.mapToAccountInfoDto(account)
  }

  /**
   * Aggiorna le informazioni di base del profilo per un dato account (nome, cognome, numero di telefono).
   *
   * @param id L'ID dell'account da aggiornare.
   * @param dto DTO contenente i nuovi dati del profilo.
   * @returns AccountInfoDto - Le informazioni aggiornate dell'account.
   * @throws NotFoundException Se l'account non esiste.
   * @throws InternalServerErrorException Se l'aggiornamento fallisce.
   */
  async updateProfile(
    id: number,
    dto: UpdateAccountProfileDto,
  ): Promise<AccountInfoDto> {
    await this.ensureAccountExists(id)

    try {
      const updatedAccount = await this.accountRepo.updateAccount(id, {
        name: dto.name,
        surname: dto.surname,
        phoneNumber: dto.phoneNumber,
        fiscalCode: dto.fiscalCode,
      })
      this.logger.log(`Profilo account ${id} aggiornato.`)
      return this.mapToAccountInfoDto(updatedAccount)
    } catch (error) {
      this.logger.error(
        `Errore nell'aggiornamento del profilo per account ${id}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile aggiornare il profilo. Riprova più tardi.",
      )
    }
  }

  async updateProfilePicture(
    id: number,
    profilePicture: string,
  ): Promise<AccountInfoDto> {
    await this.ensureAccountExists(id)

    try {
      const updatedAccount = await this.accountRepo.updateAccount(id, {
        profilePicture: profilePicture
      })
      this.logger.log(`Foto profilo account ${id} aggiornato.`)
      return this.mapToAccountInfoDto(updatedAccount)
    } catch (error) {
      this.logger.error(
        `Errore nell'aggiornamento del profilo per account ${id}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile aggiornare il profilo. Riprova più tardi.",
      )
    }
  }

  /**
   * Aggiorna l'indirizzo email di un account esistente.
   * Invia un'email di conferma al nuovo indirizzo.
   *
   * @param id L'ID dell'account.
   * @param dto DTO contenente la nuova email.
   * @returns AccountInfoDto - Le informazioni aggiornate dell'account.
   * @throws BadRequestException Se la nuova email è già in uso.
   * @throws NotFoundException Se l'account non esiste.
   * @throws InternalServerErrorException Per altri errori.
   */
  async updateEmail(id: number, dto: UpdateEmailDto): Promise<AccountInfoDto> {
    await this.ensureAccountExists(id)

    try {
      const updatedAccount = await this.accountRepo.updateAccount(id, {
        email: dto.newEmail,
      })
      try {
        this.logger.log(`Tentativo di invio mail a ${dto.newEmail}`)
        await this.emailService.sendEmailChangedConfirmation(dto.newEmail, updatedAccount.role)
        this.logger.log(`Invio mail a ${dto.newEmail} avvenuto con successo`)
      } catch (error) {
        this.logger.error(`Invio mail a ${dto.newEmail} fallito`)
        this.logger.error(`errore: ${error.message}`)
      }
      this.logger.log(`Email account ${id} aggiornata a ${dto.newEmail}.`)
      return this.mapToAccountInfoDto(updatedAccount)
    } catch (error) {
      if ((error as any).code === "P2002") {
        throw new BadRequestException("Questa email è già in uso.")
      }
      this.logger.error(
        `Errore nell'aggiornamento dell'email per account ${id}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile aggiornare l'email. Riprova più tardi.",
      )
    }
  }

  /**
   * Aggiorna la password per un account esistente.
   * Valida la password corrente prima di consentire l'aggiornamento.
   * Invia un'email di conferma dopo l'aggiornamento.
   *
   * @param id L'ID dell'account.
   * @param dto DTO contenente la password corrente e la nuova password.
   * @returns AccountInfoDto - Le informazioni aggiornate dell'account.
   * @throws NotFoundException se account non è trovato o non ha password locale
   * @throws BadRequestException se password corrente è incorretta
   * @throws InternalServerErrorException per errori imprevisti
   */
  async updatePassword(
    id: number,
    dto: UpdatePasswordDto,
  ): Promise<AccountInfoDto> {
    const account = await this.accountRepo.findById(id)
    if (!account) {
      this.logger.error(`Account ${id} non trovato.`)
      throw new NotFoundException("Account non trovato.")
    }

    if (!account.password) {
      this.logger.error(`Questo account ${id} non consente l'accesso tramite password o non ne ha una impostata.`)
      throw new BadRequestException(
        "Questo account non consente l'accesso tramite password o non ne ha una impostata.",
      )
    }

    const passwordMatch = await EncryptUtils.match(
      dto.currentPassword,
      account.password,
    )
    if (!passwordMatch) {
      this.logger.error(`La password attuale inserita da Account ${id} non è corretta.`)
      throw new BadRequestException("La password attuale non è corretta.")
    }

    try {
      const newEncryptedPassword = await EncryptUtils.encrypt(dto.newPassword)
      const updatedAccount = await this.accountRepo.updateAccount(id, {
        password: newEncryptedPassword,
      })
      this.logger.log(`Password account ${id} aggiornata.`)
      try {
        this.logger.log(`Tentativo invio mail a ${account.email}`)
        await this.emailService.sendPasswordChangedConfirmation(account.email, account.role)
        this.logger.log(`Invio mail a ${account.email} avvenuto con successo`)
      } catch (error) {
        this.logger.error(`Invio mail a ${account.email} fallito.`)
      }
      return this.mapToAccountInfoDto(updatedAccount)
    } catch (error) {
      this.logger.error(
        `Errore nell'aggiornamento della password per account ${id}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Errore interno: impossibile aggiornare la password.",
      )
    }
  }

  /**
   * Disattiva (cancellazione logica) il proprio account impostando il flag "active" su false.
   *
   * @param requestingUser L'oggetto Account dell'utente che richiede la disattivazione.
   * @throws ForbiddenException Se l'utente è un SYSTEM_ADMIN (non può essere cancellato).
   * @throws InternalServerErrorException Per errori imprevisti durante la disattivazione.
   */
  async deleteAccountProfile(requestingUser: Account): Promise<void> {
    if (requestingUser.role === AccountRole.SYSTEM_ADMIN) {
      this.logger.error(`L'amministratore di sistema non può auto-cancellarsi.`)
      throw new ForbiddenException(
        "L'amministratore di sistema non può auto-cancellarsi.",
      )
    }

    try {
      await this.accountRepo.updateAccount(requestingUser.id, { active: false })
      this.logger.log(`Account ${requestingUser.id} disattivato (auto-cancellazione).`)
    } catch (error) {
      this.logger.error(
        `Errore inatteso durante l'auto-disattivazione dell'account ${requestingUser.id}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile disattivare il tuo account. Riprova più tardi.",
      )
    }
  }

  async deleteAccountPhysically(accountId: number): Promise<Account> {
    return await this.accountRepo.deletePhysically(accountId);
  }

  // ---
  // ## Gestione Account (Funzionalità Admin)
  // ---


  /**
   * Recupera un elenco di tutti gli account nel sistema.
   * Endpoint per soli admin. Considerare la paginazione per dataset di grandi dimensioni.
   *
   * @returns Lista di AccountInfoDto.
   * @throws InternalServerErrorException se la query al DB fallisce
   */
  async listAll(): Promise<AccountInfoDto[]> {
    try {
      const accounts = await this.accountRepo.allAccounts()
      return accounts.map((account) => this.mapToAccountInfoDto(account))
    } catch (error) {
      this.logger.error("Errore nel recupero di tutti gli account", error.stack)
      throw new InternalServerErrorException(
        "Impossibile recuperare gli account. Riprova più tardi.",
      )
    }
  }

  /**
   * Recupera tutti gli account con un ruolo specifico.
   *
   * @param role Valore enum AccountRole (ADMIN, CUSTOMER, etc.).
   * @returns Lista di AccountInfoDto.
   * @throws BadRequestException se il ruolo non è valido.
   * @throws InternalServerErrorException per errori del DB.
   */
  async listByRole(role: AccountRole): Promise<AccountInfoDto[]> {
    if (!Object.values(AccountRole).includes(role)) {
      throw new BadRequestException("Ruolo non valido.")
    }

    try {
      const accounts = await this.accountRepo.findByRole(role)
      return accounts.map((account) => this.mapToAccountInfoDto(account))
    } catch (error) {
      this.logger.error(
        `Errore nel recupero degli account per ruolo: ${role}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile recuperare gli account per ruolo. Riprova più tardi.",
      )
    }
  }

  /**
   * Recupera tutti gli account filtrati per il loro stato "attivo".
   *
   * @param active True per ottenere account attivi, False per quelli disattivati.
   * @returns Lista di AccountInfoDto.
   * @throws InternalServerErrorException se la query fallisce.
   */
  async listByActive(active: boolean): Promise<AccountInfoDto[]> {
    try {
      const accounts = await this.accountRepo.findByActive(active)
      return accounts.map((account) => this.mapToAccountInfoDto(account))
    } catch (error) {
      this.logger.error(
        `Errore nel recupero degli account per stato attivo=${active}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile recuperare gli account per stato attivo. Riprova più tardi.",
      )
    }
  }

  /**
   * Recupera tutti gli account filtrati per il loro stato "verificato".
   *
   * @param verified True per ottenere account verificati, False per quelli non verificati.
   * @returns Lista di AccountInfoDto.
   * @throws InternalServerErrorException se la query fallisce.
   */
  async listByVerified(verified: boolean): Promise<AccountInfoDto[]> {
    try {
      const accounts = await this.accountRepo.findByVerified(verified)
      return accounts.map((account) => this.mapToAccountInfoDto(account))
    } catch (error) {
      this.logger.error(
        `Errore nel recupero degli account per stato verificato=${verified}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile recuperare gli account per stato di verifica. Riprova più tardi.",
      )
    }
  }

  /**
   * Cerca account per nome, cognome o email (corrispondenza parziale).
   *
   * @param query Parola chiave di ricerca.
   * @returns Lista di AccountInfoDto corrispondenti.
   * @throws BadRequestException se la query è vuota.
   * @throws InternalServerErrorException per errori imprevisti.
   */
  async searchAccounts(query: string): Promise<AccountInfoDto[]> {
    if (!query?.trim()) {
      throw new BadRequestException("La query di ricerca è obbligatoria.")
    }

    try {
      const accounts = await this.accountRepo.searchByParams(query)
      return accounts.map((account) => this.mapToAccountInfoDto(account))
    } catch (error) {
      this.logger.error(
        `Errore nella ricerca account con query "${query}"`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile eseguire la ricerca account. Riprova più tardi.",
      )
    }
  }

  /**
   * Abilita o disabilita un account specifico modificando il suo stato "active".
   * Include controlli di sicurezza per evitare la disattivazione involontaria di admin critici.
   *
   * @param targetAccountId ID dell'account da aggiornare.
   * @param active True per abilitare, False per disattivare.
   * @throws NotFoundException se l'account non esiste.
   * @throws BadRequestException se si tenta di disabilitare l'ultimo ADMIN/SYSTEM_ADMIN.
   * @throws InternalServerErrorException per errori del DB.
   */
  async adminToggleActive(
    targetAccountId: number,
    active: boolean,
  ): Promise<void> {
    const targetAccount = await this.ensureAccountExists(targetAccountId)

    if (
      !active &&
      (targetAccount.role === AccountRole.ADMIN ||
        targetAccount.role === AccountRole.SYSTEM_ADMIN)
    ) {
      const activeAdmins = await this.accountRepo.countActiveAdmins()
      if (activeAdmins <= 1 && targetAccount.role === AccountRole.ADMIN) {
        this.logger.error("Impossibile disabilitare l'unico amministratore attivo rimasto.")
        throw new BadRequestException(
          "Impossibile disabilitare l'unico amministratore attivo rimasto.",
        )
      }
      if (
        activeAdmins <= 1 &&
        targetAccount.role === AccountRole.SYSTEM_ADMIN
      ) {
        throw new BadRequestException(
          "Impossibile disabilitare l'unico amministratore di sistema attivo rimasto.",
        )
      }
    }

    try {
      await this.accountRepo.updateAccount(targetAccountId, { active })
      this.logger.log(
        `Stato attivo dell'account ${targetAccountId} impostato a ${active}.`,
      )
    } catch (error) {
      this.logger.error(
        `Fallita l'attivazione/disattivazione dell'account ${targetAccountId}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile aggiornare lo stato dell'account. Riprova più tardi.",
      )
    }
  }

  /**
   * Disattiva (cancellazione logica) un account specifico impostando il suo flag "active" su false.
   * Questo non rimuove il record dal database.
   * Controlli di sicurezza:
   * - Un ADMIN/SYSTEM_ADMIN non può cancellare se stesso.
   * - Un ADMIN non può cancellare altri ADMIN/SYSTEM_ADMIN.
   * - Un utente normale può cancellare solo il proprio account.
   *
   * @param targetAccountId L'ID dell'account da disattivare.
   * @param requestingUser L'oggetto Account dell'utente che richiede la disattivazione.
   * @throws NotFoundException se l'account target non è trovato.
   * @throws ForbiddenException per violazioni delle regole di autorizzazione.
   * @throws InternalServerErrorException per errori imprevisti.
   */
  async deleteAccount(
    targetAccountId: number,
    requestingUser: Account,
  ): Promise<void> {
    const targetAccount = await this.ensureAccountExists(targetAccountId)

    // Regole di autorizzazione per la cancellazione dell'account
    if (requestingUser.role === AccountRole.SYSTEM_ADMIN) {
      if (requestingUser.id === targetAccountId) {
        this.logger.error("L'amministratore di sistema non può cancellare se stesso.")
        throw new ForbiddenException(
          "L'amministratore di sistema non può cancellare se stesso.",
        )
      }
    } else if (requestingUser.role === AccountRole.ADMIN) {
      if (requestingUser.id === targetAccountId) {
        this.logger.error("Gli amministratori non possono cancellare loro stessi.")
        throw new ForbiddenException(
          "Gli amministratori non possono cancellare loro stessi.",
        )
      }
      if (
        targetAccount.role === AccountRole.ADMIN ||
        targetAccount.role === AccountRole.SYSTEM_ADMIN
      ) {
        this.logger.error("Gli amministratori non possono cancellare altri amministratori o amministratori di sistema.")
        throw new ForbiddenException(
          "Gli amministratori non possono cancellare altri amministratori o amministratori di sistema.",
        )
      }
    } else {
      if (requestingUser.id !== targetAccountId) {
        this.logger.error(`Account con id ${requestingUser.id} non autorizzato a cancellare questo account ${targetAccountId}.`)
        throw new ForbiddenException(
          "Non sei autorizzato a cancellare questo account.",
        )
      }
    }

    // Logica per prevenire la disattivazione dell'ultimo admin/system_admin
    if (
      targetAccount.active &&
      (targetAccount.role === AccountRole.ADMIN ||
        targetAccount.role === AccountRole.SYSTEM_ADMIN)
    ) {
      const activeAdminsCount = await this.accountRepo.countActiveAdmins()
      if (activeAdminsCount <= 1) {
        this.logger.error("Impossibile cancellare l'ultimo amministratore attivo del sistema.")
        throw new ForbiddenException(
          "Impossibile cancellare l'ultimo amministratore attivo del sistema.",
        )
      }
    }

    try {
      await this.accountRepo.updateAccount(targetAccountId, { active: false })
      this.logger.log(
        `Account ${targetAccountId} disattivato da user ${requestingUser.id} (${requestingUser.role}).`,
      )
    } catch (error) {
      this.logger.error(
        `Errore inatteso durante la disattivazione dell'account ${targetAccountId}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        "Impossibile disattivare l'account. Riprova più tardi.",
      )
    }
  }

  /**
   * Carica o aggiorna la foto profilo di un utente.
   * Gestisce la cancellazione del vecchio file e il rollback in caso di errore.
   * @param accountId L'ID dell'account da aggiornare.
   * @param file Il nuovo file della foto profilo caricato.
   * @param driverId
   * @returns Le informazioni aggiornate dell'account.
   */
  async uploadProfilePicture(
    accountId: number,
    file: Express.Multer.File,
    driverId?: number,
  ): Promise<AccountInfoDto> {
    let account;
    if (driverId) {
      account = await this.ensureAccountExists(driverId);
    } else {
      account = await this.ensureAccountExists(accountId);
    }

    const newProfilePicturePath = await this.storageService.upload(
      file,
      ['profile-pictures'],
      `account-${account.email}`
    );


    try {
      if (driverId) {
        await this.accountRepo.updateAccount(driverId, {
          profilePicture: newProfilePicturePath,
        });
        this.logger.log(`Foto profilo per l'account ${driverId} aggiornata nel DB.`);
        return this.getAccountInfo(driverId);
      } else {
        await this.accountRepo.updateAccount(accountId, {
          profilePicture: newProfilePicturePath,
        });
        this.logger.log(`Foto profilo per l'account ${accountId} aggiornata nel DB.`);
        return this.getAccountInfo(accountId);
      }

    } catch (error) {
      this.logger.error(`Fallimento aggiornamento DB per la foto profilo dell'account ${accountId}. Avvio rollback del file...`, error.stack);
      await this.storageService.deleteFile(newProfilePicturePath);

      throw new InternalServerErrorException("Impossibile aggiornare la foto profilo. L'operazione è stata annullata.");
    }
  }

  // ---
  // ## Metodi Helper Interni
  // ---

  /**
   * Mappa un oggetto Account (proveniente da Prisma) a un AccountInfoDto.
   * Questo metodo è usato internamente per standardizzare l'output degli Account,
   * escludendo campi sensibili come la password.
   * @param account L'oggetto Account da mappare.
   * @returns Un oggetto AccountInfoDto.
   */
  private mapToAccountInfoDto(account: Account): AccountInfoDto {
    return {
      id: account.id,
      email: account.email,
      phoneNumber: account.phoneNumber,
      name: account.name,
      surname: account.surname,
      role: account.role,
      profilePicture: account.profilePicture,
      active: account.active,
      verified: account.verified,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }
  }

  /**
   * Verifica l'esistenza di un account tramite ID.
   * @param id L'ID dell'account da verificare.
   * @returns L'oggetto Account se trovato.
   * @throws NotFoundException Se l'account non viene trovato.
   */
  private async ensureAccountExists(id: number): Promise<Account> {
    const account = await this.accountRepo.findById(id)
    if (!account) {
      throw new NotFoundException("Account non trovato.")
    }
    return account
  }
}
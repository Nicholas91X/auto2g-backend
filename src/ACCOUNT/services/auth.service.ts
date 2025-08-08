import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Account, AccountRole } from "@prisma/client"
import { AccountRepository } from "../repositories/account.repository"
import { JwtAccountPayload } from "../dtos/jwtAccountPayload.dto"
import { EncryptUtils } from "../../utils/encrypt.utils"
import {
  type IEmailService,
  IEmailServiceToken,
} from "../../EMAIL/interfaces/email-service.interface"

/**
 * Servizio per la gestione dell'autenticazione utente.
 * Include logiche di login, generazione e verifica di JWT per sessioni,
 * conferma email, reset password e onboarding.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly jwtService: JwtService,
    @Inject(IEmailServiceToken)
    private readonly emailService: IEmailService,
  ) {}

  // ---
  // ## Autenticazione e Login
  // ---

  /**
   * Logica di login specifica per i clienti (CUSTOMER).
   * Ora delega i controlli comuni all'helper `validateUserForLogin`.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: any }> {
    const user = await this.validateUserForLogin(email, password)

    const jwtToken = await this.generateToken(user)

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
    }

    this.logger.log(`Utente ${user.email} loggato con successo.`)
    return { token: jwtToken, user: safeUser }
  }

  /**
   * Contiene tutti i controlli comuni e ripetuti per la validazione di un utente al login.
   * @returns L'oggetto Account completo se la validazione ha successo.
   * @throws UnauthorizedException se un qualsiasi controllo fallisce.
   */
  private async validateUserForLogin(
    email: string,
    password: string,
  ): Promise<Account> {
    const user = await this.accountRepository.findByEmail(email)

    if (!user) {
      this.logger.error(
        `Credenziali non valide. Tentativo di login per account con email ${email}`,
      )
      throw new UnauthorizedException("Credenziali non valide.")
    }
    if (!user.verified) {
      this.logger.error(
        `Account non verificato. Tentativo di login per account con email ${email}`,
      )
      throw new UnauthorizedException(
        "Account non verificato. Controlla la tua email.",
      )
    }
    if (!user.active) {
      this.logger.error(
        `Account non disabilitato. Tentativo di login per account con email ${email}`,
      )
      throw new UnauthorizedException("Account disabilitato.")
    }
    if (!user.password) {
      this.logger.error(
        `Questo account non consente l'accesso tramite password. Tentativo di login per account con email ${email}`,
      )
      throw new UnauthorizedException(
        "Questo account non consente l'accesso tramite password.",
      )
    }

    const isPasswordMatch = await EncryptUtils.match(password, user.password)
    if (!isPasswordMatch) {
      this.logger.error(
        `Credenziali non valide. Tentativo di login per account con email ${email}`,
      )
      throw new UnauthorizedException("Credenziali non valide.")
    }

    return user
  }

  // ---
  // ## Generazione Token JWT
  // ---

  /**
   * Genera un token JWT arricchito con ID contestuali per ruoli specifici.
   */
  async generateToken(account: Account): Promise<string> {
    const payload: JwtAccountPayload = {
      id: account.id,
      email: account.email,
      role: account.role,
      verified: account.verified,
      active: account.active,
    }

    return this.jwtService.signAsync(payload)
  }

  /**
   * Genera un token JWT di breve durata per la conferma dell'email.
   * @param user L'account per cui generare il token.
   * @returns Un token di conferma firmato.
   */
  async generateRegistrationConfirmToken(user: Account): Promise<string> {
    return this.jwtService.signAsync(
      {
        type: "confirmation",
        id: user.id,
      },
      {
        expiresIn: "2h",
      },
    )
  }

  /**
   * Genera un token JWT di breve durata (30 minuti) per il reset della password.
   * @param account L'account per cui resettare la password.
   * @returns Un token JWT firmato per il reset della password.
   */
  async generatePasswordResetToken(account: Account): Promise<string> {
    return this.jwtService.signAsync(
      {
        type: "password-reset",
        id: account.id,
      },
      {
        expiresIn: "30m",
      },
    )
  }

  /**
   * Genera un token di conferma minimale per usi temporanei (es. link di onboarding).
   * Include solo email e companyName (se pertinenti).
   * @param email L'email da includere nel token.
   * @param companyName Il nome dell'azienda da includere (opzionale).
   * @returns Un token JWT firmato.
   */
  async generateSimpleToken(
    email: string,
    companyName?: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        type: "onboarding-simple",
        email,
        companyName,
      },
      {
        expiresIn: "2h",
      },
    )
  }

  // ---
  // ## Verifica Token JWT
  // ---

  /**
   * Verifica un token di conferma email.
   * Marchia l'utente come verificato e restituisce un token di sessione.
   * Questo è lo STEP 2 nel flusso di onboarding aziendale.
   * @param token Il token JWT di conferma.
   * @returns Un oggetto contenente il token di sessione, l'email dell'utente e il nome dell'azienda (se applicabile).
   * @throws UnauthorizedException Se il token non è valido o scaduto, o il tipo di token è errato.
   * @throws NotFoundException Se l'utente non viene trovato dopo la verifica del token.
   */
  async verifyUser(token: string): Promise<{ token: string; email: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token)

      if (payload.type !== "confirmation") {
        throw new UnauthorizedException("Tipo di token di conferma non valido.")
      }

      const user = await this.accountRepository.findById(payload.id)

      await this.accountRepository.verifyUser(user.id)

      const sessionJwt = await this.generateToken(user)

      this.logger.log(`Utente ${user.email} verificato con successo.`)
      return {
        token: sessionJwt,
        email: user.email,
      }
    } catch (error) {
      this.logger.error("Verifica email fallita", error.stack)
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error
      }
      throw new UnauthorizedException("Token di conferma non valido o scaduto.")
    }
  }

  /**
   * Verifica un token di reset password e restituisce l'ID dell'account associato.
   * @param token Il token JWT ricevuto via email per il reset.
   * @returns L'ID dell'account se il token è valido.
   * @throws UnauthorizedException Se il token non è valido, il tipo è errato o è scaduto.
   */
  async verifyPasswordResetToken(token: string): Promise<number> {
    try {
      const payload = await this.jwtService.verifyAsync(token)

      if (payload.type !== "password-reset") {
        this.logger.error(
          `Tipo di token ${payload.type} non valido per il reset della password.`,
        )
        throw new UnauthorizedException(
          "Tipo di token non valido per il reset della password.",
        )
      }
      if (typeof payload.id !== "number") {
        this.logger.error(
          `Payload ${payload.id} del token di reset password malformato.`,
        )
        throw new UnauthorizedException(
          "Payload del token di reset password malformato.",
        )
      }
      return payload.id
    } catch (error) {
      this.logger.error(
        "Token di reset password non valido o scaduto",
        error.stack,
      )
      throw new UnauthorizedException(
        "Token di reset password non valido o scaduto.",
      )
    }
  }

  /**
   * Verifica un token di onboarding semplice e restituisce email e nome dell'azienda.
   * Utilizzato per il primo step del processo di onboarding.
   * @param token Il token JWT ricevuto via email.
   * @returns Un oggetto con email e nome dell'azienda se il token è valido.
   * @throws UnauthorizedException Se il token non è valido, il tipo è errato o è scaduto.
   */
  async verifySimpleToken(
    token: string,
  ): Promise<{ email: string; companyName: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token)

      if (
        payload.type !== "onboarding-simple" ||
        !payload.email ||
        !payload.companyName
      ) {
        this.logger.error(
          `"Payload ${payload} del token di onboarding non valido.`,
        )
        throw new UnauthorizedException(
          "Payload del token di onboarding non valido.",
        )
      }

      return {
        email: payload.email,
        companyName: payload.companyName,
      }
    } catch (error) {
      this.logger.error("Token di onboarding non valido", error.stack)
      throw new UnauthorizedException(
        "Token di onboarding non valido o scaduto.",
      )
    }
  }

  async sendPasswordResetToken(email: string): Promise<void> {
    const account = await this.accountRepository.findByEmail(email)
    if (!account) return

    const token = await this.generatePasswordResetToken(account)
    const resetUrl =
      account.role === AccountRole.CUSTOMER
        ? `${process.env.FRONTEND_BASE_CUSTOMER_URL}/reset/confirm?token=${token}`
        : `${process.env.FRONTEND_BASE_URL}/reset/confirm?token=${token}`

    await this.emailService.sendRecoverPassword(email, resetUrl)
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const accountId = await this.verifyPasswordResetToken(token)
    const encrypted = await EncryptUtils.encrypt(newPassword)
    await this.accountRepository.updateAccount(accountId, {
      password: encrypted,
    })

    const account = await this.accountRepository.findById(accountId)
    if (!account)
      throw new NotFoundException(
        "Account non trovato dopo il reset della password.",
      )

    await this.emailService.sendPasswordChangedConfirmation(
      account.email,
      account.role,
    )
  }
}

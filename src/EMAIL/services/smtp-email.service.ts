import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"
import * as path from "path"
import * as fs from "fs"
import { IEmailService } from "../interfaces/email-service.interface"

interface EmailTemplateData {
  [key: string]: any
}

@Injectable()
export class SmtpEmailService implements IEmailService {
  private readonly logger = new Logger(SmtpEmailService.name)
  private readonly transporter: nodemailer.Transporter
  private readonly defaultFrom: string
  private readonly frontendBaseUrl: string
  private readonly emailTemplatesDir: string

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>("SMTP_HOST")
    const port = this.configService.get<number>("SMTP_PORT")
    const user = this.configService.get<string>("SMTP_USER")
    const pass = this.configService.get<string>("SMTP_PASS")
    const secure = this.configService.get<boolean>("SMTP_SECURE", true)

    if (!host || !port || !user || !pass) {
      this.logger.error(
        "SMTP credentials not properly configured. Missing: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.",
      )
      throw new Error("Errore di configurazione: Credenziali SMTP mancanti.")
    }

    this.defaultFrom = `"Auto2G" <${user}>`
    this.frontendBaseUrl = this.configService.get<string>(
      "FRONTEND_BASE_URL",
      "",
    )
    if (!this.frontendBaseUrl) {
      this.logger.error(
        "FRONTEND_BASE_URL not configured. Email links may be broken.",
      )
      throw new Error("Errore di configurazione: URL del frontend mancante.")
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })

    this.emailTemplatesDir = path.join(
      __dirname,
      "..",
      "..",
      "assets",
      "emails",
    )
    if (__dirname.includes("dist")) {
      this.emailTemplatesDir = path.join(
        process.cwd(),
        "dist",
        "assets",
        "emails",
      )
    }

    this.logger.warn(
      `SMTP transporter configured. Templates directory: ${this.emailTemplatesDir}`,
    )
  }

  // ---
  // ## Metodo Generale di Invio Email
  // ---

  /**
   * Metodo privato per inviare email con un corpo HTML generato da un template.
   * @param to Destinatario dell'email.
   * @param subject Oggetto dell'email.
   * @param templateName Nome del file template (senza estensione .html).
   * @param data Dati da passare al template per la renderizzazione.
   * @returns Promise<void>
   * @throws InternalServerErrorException Se l'email non può essere inviata o il template è mancante.
   */
  private async sendTemplatedMail(
    to: string,
    subject: string,
    templateName: string,
    data: EmailTemplateData = {},
  ): Promise<void> {
    const templatePath = path.join(
      this.emailTemplatesDir,
      `${templateName}.html`,
    )

    let htmlContent: string
    try {
      htmlContent = fs.readFileSync(templatePath, "utf8")
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          htmlContent = htmlContent.replace(
            new RegExp(`{{${key}}}`, "g"),
            data[key],
          )
        }
      }
    } catch (error) {
      this.logger.error(
        `Errore lettura o renderizzazione template "${templateName}": ${error.message}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        `Impossibile caricare il template email: ${templateName}`,
      )
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to,
        subject,
        html: htmlContent,
      })
      this.logger.log(`Email "${subject}" sent to ${to}: ${info.messageId}`)
    } catch (error) {
      this.logger.error(
        `Fallimento invio email "${subject}" a ${to}: ${error.message}`,
        error.stack,
      )
      throw new InternalServerErrorException(
        `Impossibile inviare l'email: ${subject}`,
      )
    }
  }

  // ---
  // ## Metodi Specifici di Invio Email
  // ---

  /**
   * Invia un'email di verifica per la registrazione di un account utente.
   * @param to Destinatario dell'email.
   * @param token Token di verifica per il link.
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendBaseUrl}/verify-email?token=${token}`
    await this.sendTemplatedMail(
      to,
      "Verifica la tua registrazione",
      "verification-email",
      {
        verificationUrl,
      },
    )
  }

  /**
   * Invia un'email di verifica per la registrazione di un account azienda tramite onboarding.
   * @param to Destinatario dell'email.
   * @param token Token di verifica per il link.
   */
  async sendVerificationOnboardingEmail(
    to: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendBaseUrl}/onboarding/verify?token=${token}`
    await this.sendTemplatedMail(
      to,
      "Verifica la tua registrazione Aziendale",
      "onboarding-verification-email",
      {
        verificationUrl,
      },
    )
  }

  /**
   * Invia un'email con una password temporanea (per accessi admin o iniziali).
   * @param email Destinatario dell'email.
   * @param password Password temporanea.
   */
  async sendTemporaryPassword(email: string, password: string): Promise<void> {
    await this.sendTemplatedMail(
      email,
      "Accesso Admin - Password Temporanea",
      "temporary-password",
      {
        email,
        password,
      },
    )
  }

  /**
   * Invia un'email di setup per un account amministratore, includendo password temporanea e link di verifica.
   * @param email Destinatario dell'email.
   * @param password Password temporanea.
   * @param token Token di verifica email.
   */
  async sendAdminAccountSetup(
    email: string,
    password: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendBaseUrl}/verify-email?token=${token}`
    await this.sendTemplatedMail(
      email,
      "Accesso Amministratore – Completa la registrazione",
      "admin-setup-email",
      {
        email,
        password,
        verificationUrl,
      },
    )
  }

  /**
   * Invia l'email di benvenuto e setup a un nuovo venditore.
   * Include la password temporanea e il link per attivare l'account.
   */
  async sendSellerSetupEmail(
    to: string,
    name: string,
    temporaryPassword: string,
    token: string,
  ): Promise<void> {
    const setupUrl = `${this.frontendBaseUrl}/seller-setup?token=${token}`;

    await this.sendTemplatedMail(
      to,
      "Benvenuto in Auto2G! Attiva il tuo account",
      "seller-welcome-setup",
      {
        name: name,
        email: to,
        temporaryPassword: temporaryPassword,
        setupUrl: setupUrl,
      },
    );
  }

  /**
   * Invia un'email per il recupero della password, con un link di reset.
   * @param to Destinatario dell'email.
   * @param resetUrl URL completo per reimpostare la password.
   */
  async sendRecoverPassword(to: string, resetUrl: string): Promise<void> {
    await this.sendTemplatedMail(
      to,
      "Recupera la tua password",
      "recover-password",
      {
        resetUrl,
      },
    )
  }

  /**
   * Invia un'email di conferma per la modifica della password.
   * @param to Destinatario dell'email.
   */
  async sendPasswordChangedConfirmation(to: string): Promise<void> {
    let returnUrl = this.frontendBaseUrl;
    await this.sendTemplatedMail(
      to,
      "Password modificata con successo",
      "password-changed",
      {
        returnUrl,
      },
    )
  }

  /**
   * Invia un'email di conferma per la modifica dell'indirizzo email.
   * @param to Destinatario dell'email.
   */
  async sendEmailChangedConfirmation(to: string): Promise<void> {
    let returnUrl = this.frontendBaseUrl;
    await this.sendTemplatedMail(
      to,
      "Email modificata con successo",
      "email-changed",
      {
        returnUrl,
      },
    )
  }
}
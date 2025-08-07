import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common"
import { AccountRole } from "@prisma/client"
import { PrismaRepository } from "../../database/repositories/prisma.repository"
import { EncryptUtils } from "../../utils/encrypt.utils"

@Injectable()
export class DefaultAdminSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(DefaultAdminSeed.name)

  constructor(private readonly db: PrismaRepository) {}

  async onApplicationBootstrap() {
    await this.upsertAdmin()
  }

  private async upsertAdmin() {
    const email = process.env.DEFAULT_ADMIN_EMAIL ?? "romitinicholas91@hotmail.it"
    const password = process.env.DEFAULT_ADMIN_PW ?? "nico84397"
    const pwdEncrypted = await EncryptUtils.encrypt(password)

    try {
      await this.db.account.upsert({
        where: {
          email: email,
        },
        create: {
          name: "SYSTEM",
          surname: "ADMIN",
          email: email,
          password: pwdEncrypted,
          role: AccountRole.SYSTEM_ADMIN,
          verified: true,
        },
        update: {},
      })

      this.logger.debug(
        `⚠  Default admin creato –  email: ${email} | password: ${password}`,
      )
    } catch (error) {
      this.logger.error("Creazione default admin fallita", error)
    }
  }
}

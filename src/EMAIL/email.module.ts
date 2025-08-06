import { Global, Module } from "@nestjs/common"
import { SmtpEmailService } from "./services/smtp-email.service"
import { IEmailServiceToken } from "./interfaces/email-service.interface"
import { ConfigModule } from "@nestjs/config"

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: IEmailServiceToken,
      useClass: SmtpEmailService,
    },
  ],
  exports: [IEmailServiceToken],
})
export class EmailModule {}
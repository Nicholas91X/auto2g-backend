import { Module } from "@nestjs/common"
import fs from "node:fs"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { EmailModule } from "./EMAIL/email.module"
import { AccountModule } from "./ACCOUNT/account.module"
import { DatabaseModule } from "./database/database.module"
import { AutoUsataModule } from "./AUTO_USATA/autoUsata.module"
import { DashboardModule } from "./DASHBOARD/dashboard.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        privateKey: fs
          .readFileSync(configService.get<string>("JWT_PRIVATE_KEY_FILE", ""))
          .toString(),
        publicKey: fs
          .readFileSync(configService.get<string>("JWT_PUBLIC_KEY_FILE", ""))
          .toString(),
        signOptions: { algorithm: "RS256", expiresIn: "10d" },
      }),
    }),
    PassportModule,
    DatabaseModule,
    EmailModule,
    AccountModule,
    AutoUsataModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

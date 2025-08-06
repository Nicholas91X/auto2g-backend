import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LoginController } from './controllers/login.controller';
import { AuthController } from './controllers/auth.controller';
import { AccountController } from './controllers/account.controller';
import { AuthService } from './services/auth.service';
import AccountService from './services/account.service';
import { DefaultAdminSeed } from './services/defaultAdmin.seed';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AccountRepository } from './repositories/account.repository';
import { EmailModule } from '../EMAIL/email.module';
import { DocumentStorageServiceToken } from './services/documentStorage/documentStorage.interface';
import { LocalDocumentStorageService } from './services/documentStorage/localDocumentStorage.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), EmailModule],
  controllers: [LoginController, AuthController, AccountController],
  providers: [
    // Services
    AuthService,
    AccountService,
    DefaultAdminSeed,
    JwtStrategy,
    {
      provide: DocumentStorageServiceToken,
      useClass: LocalDocumentStorageService,
    },

    // Repositories
    AccountRepository,
  ],
  exports: [
    AuthService,
    AccountService,
    AccountRepository,
    PassportModule,
  ],
})
export class AccountModule {}

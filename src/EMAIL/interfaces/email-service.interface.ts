import { AccountRole } from "@prisma/client"

export interface IEmailService {
  sendVerificationEmail(to: string, token: string, isCustomer: boolean): Promise<void>;
  sendVerificationOnboardingEmail(to: string, token: string): Promise<void>;
  sendRecoverPassword(to: string, resetUrl: string): Promise<void>;
  sendPasswordChangedConfirmation(to: string, role: AccountRole): Promise<void>;
  sendEmailChangedConfirmation(to: string, role: AccountRole): Promise<void>;
  sendTemporaryPassword(email: string, password: string): Promise<void>;
  sendAdminAccountSetup(email: string, password: string, token: string): Promise<void>
}

export const IEmailServiceToken = Symbol('IEmailService');

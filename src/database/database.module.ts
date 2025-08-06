import { Global, Module } from "@nestjs/common"
import { PrismaRepository } from "./repositories/prisma.repository"

@Global()
@Module({
  providers: [PrismaRepository],
  exports: [PrismaRepository],
})
export class DatabaseModule {}
import { Module } from "@nestjs/common"
import {
  DocumentStorageServiceToken,
} from '../ACCOUNT/services/documentStorage/documentStorage.interface';
import {
  LocalDocumentStorageService,
} from '../ACCOUNT/services/documentStorage/localDocumentStorage.service';
import { AutoUsataController } from "./controllers/autoUsata.controller"
import { AutoUsataService } from "./services/autoUsata.service"
import { AutoUsataRepository } from "./repositories/autoUsata.repository"
import { ImmagineAutoRepository } from "./repositories/immagineAuto.repository"
import { VenditaController } from "./controllers/vendita.controller"
import { VenditaService } from "./services/vendita.service"
import { VenditaRepository } from "./repositories/vendita.repository"
import { AccountRepository } from "../ACCOUNT/repositories/account.repository"

@Module({
  controllers: [AutoUsataController, VenditaController],
  providers: [
    AutoUsataService,
    VenditaService,
    AutoUsataRepository,
    VenditaRepository,
    AccountRepository,
    ImmagineAutoRepository,
    {
      provide: DocumentStorageServiceToken,
      useClass: LocalDocumentStorageService,
    },
  ],
})
export class AutoUsataModule {}
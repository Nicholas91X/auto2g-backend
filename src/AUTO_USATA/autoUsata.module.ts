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

@Module({
  controllers: [AutoUsataController],
  providers: [
    AutoUsataService,
    AutoUsataRepository,
    ImmagineAutoRepository,
    {
      provide: DocumentStorageServiceToken,
      useClass: LocalDocumentStorageService,
    },
  ],
})
export class AutoUsataModule {}
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"
import { Roles } from "../../ACCOUNT/decorators/roles.decorator"
import { AccountRoleEnum } from "../../ACCOUNT/enums/accountRoleEnum"
import { TokenGuard } from "../../ACCOUNT/guards/token.guard"
import { FileInterceptor } from "@nestjs/platform-express"
import { AutoUsataService } from "../services/autoUsata.service"
import { AutoUsataDto } from "../dtos/autoUsata.dto"
import { CreateAutoUsataDto } from "../dtos/createAutoUsata.dto"
import { UpdateAutoUsataDto } from "../dtos/updateAutoUsata.dto"

@ApiTags("Auto Usata")
@Controller("auto-usata")
export class AutoUsataController {
  constructor(private readonly autoUsataService: AutoUsataService) {}

  @Get()
  @ApiOperation({ summary: "Recupera la lista di tutte le auto usate" })
  @ApiResponse({ status: 200, type: [AutoUsataDto] })
  findAll(): Promise<AutoUsataDto[]> {
    return this.autoUsataService.findAll()
  }

  @Get(":id")
  @ApiOperation({ summary: "Recupera i dettagli di una singola auto usata" })
  @ApiResponse({ status: 200, type: AutoUsataDto })
  @ApiResponse({ status: 404, description: "Auto non trovata" })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<AutoUsataDto> {
    return this.autoUsataService.findOne(id)
  }

  @Post()
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Aggiunge una nuova auto usata (solo Admin/Seller)",
  })
  @ApiResponse({ status: 201, type: AutoUsataDto })
  create(@Body() dto: CreateAutoUsataDto): Promise<AutoUsataDto> {
    return this.autoUsataService.create(dto)
  }

  @Put(":id")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @ApiOperation({
    summary: "Aggiorna i dati di un'auto usata (solo Admin/Seller)",
  })
  @ApiResponse({ status: 200, type: AutoUsataDto })
  @ApiResponse({ status: 404, description: "Auto non trovata" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateAutoUsataDto,
  ): Promise<AutoUsataDto> {
    return this.autoUsataService.update(id, dto)
  }

  @Post(":id/immagine")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @UseInterceptors(FileInterceptor("immagine"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { immagine: { type: "string", format: "binary" } },
    },
  })
  @ApiOperation({
    summary: "Carica l'immagine per un'auto usata (solo Admin/Seller)",
  })
  uploadImage(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.autoUsataService.uploadImage(id, file)
  }

  @Delete(":id")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Rimuove un'auto usata (solo Admin/Seller)" })
  @ApiResponse({ status: 204, description: "Auto rimossa con successo" })
  @ApiResponse({ status: 404, description: "Auto non trovata" })
  remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.autoUsataService.remove(id)
  }

  @Delete(":autoId/immagine/:immagineId")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Rimuove una singola immagine da un'auto usata" })
  @ApiResponse({ status: 204, description: "Immagine rimossa con successo" })
  deleteImmagine(
    @Param("autoId", ParseIntPipe) autoId: number,
    @Param("immagineId", ParseIntPipe) immagineId: number,
  ): Promise<void> {
    return this.autoUsataService.deleteImmagine(autoId, immagineId)
  }

  @Delete(":id/immagine")
  @UseGuards(TokenGuard)
  @Roles(
    AccountRoleEnum.SYSTEM_ADMIN,
    AccountRoleEnum.ADMIN,
    AccountRoleEnum.SELLER,
  )
  @ApiBearerAuth("bearer")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Rimuove TUTTE le immagini da un'auto usata" })
  @ApiResponse({
    status: 204,
    description: "Tutte le immagini sono state rimosse",
  })
  deleteAllImmagini(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.autoUsataService.deleteAllImmagini(id)
  }
}

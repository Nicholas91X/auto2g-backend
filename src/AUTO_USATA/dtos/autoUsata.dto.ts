import { ApiProperty } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { ImmagineAutoDto } from "./immagineAutoUsata.dto"
import { AutoUsataStatus } from "@prisma/client"
import { IsEnum } from "class-validator"
import { AutoUsataStatusEnum } from "../enums/autoUsataStatusEnum"

export class AutoUsataDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: "Fiat" })
  marca: string;

  @Expose()
  @ApiProperty({ example: "500" })
  modello: string;

  @Expose()
  @ApiProperty({ example: "AA123BB" })
  targa: string;

  @Expose()
  @ApiProperty({ example: 2022 })
  anno: number;

  @Expose()
  @ApiProperty({ example: 15000.0 })
  prezzo: number;

  @Expose()
  @ApiProperty({ example: 30000 })
  km: number;

  @Expose()
  @ApiProperty({
    enum: AutoUsataStatusEnum,
    example: AutoUsataStatusEnum.DISPONIBILE,
  })
  @IsEnum(AutoUsataStatusEnum)
  status: AutoUsataStatus

  @Expose()
  @ApiProperty({ type: [ImmagineAutoDto] })
  @Type(() => ImmagineAutoDto)
  immagini: ImmagineAutoDto[];

  @Expose()
  @ApiProperty({ example: "Bellissima Fiat 500 come nuova", required: false })
  descrizione: string | null;
}
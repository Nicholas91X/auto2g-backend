import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { ImmagineAutoDto } from "./immagineAutoUsata.dto"
import {
  AutoUsataStatus,
  Carburante,
  TipoDiCambio,
  Trazione,
} from "@prisma/client"
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
  stato: AutoUsataStatus

  @Expose()
  @ApiProperty({ type: [ImmagineAutoDto] })
  @Type(() => ImmagineAutoDto)
  immagini: ImmagineAutoDto[];

  @Expose()
  @ApiPropertyOptional()
  carburante?: Carburante

  @Expose()
  @ApiPropertyOptional()
  cilindrata?: number

  @Expose()
  @ApiPropertyOptional()
  potenzaCV?: number

  @Expose()
  @ApiPropertyOptional()
  potenzaKW?: number

  @Expose()
  @ApiPropertyOptional()
  tipoDiCambio?: TipoDiCambio

  @Expose()
  @ApiPropertyOptional()
  trazione?: Trazione

  @Expose()
  @ApiPropertyOptional()
  classeEmissione?: string

  @Expose()
  @ApiPropertyOptional()
  coloreEsterno?: string

  @Expose()
  @ApiPropertyOptional()
  numeroPorte?: number

  @Expose()
  @ApiPropertyOptional()
  numeroPosti?: number

  @Expose()
  @ApiPropertyOptional()
  descrizione?: string

  @Expose()
  @ApiPropertyOptional()
  noteOptional?: string

  @Expose()
  @ApiPropertyOptional()
  abs?: boolean

  @Expose()
  @ApiPropertyOptional()
  airbag?: boolean

  @Expose()
  @ApiPropertyOptional()
  climatizzatore?: boolean

  @Expose()
  @ApiPropertyOptional()
  servosterzo?: boolean

  @Expose()
  @ApiPropertyOptional()
  navigatore?: boolean

  @Expose()
  @ApiPropertyOptional()
  sensoriParcheggio?: boolean

  @Expose()
  @ApiPropertyOptional()
  cruiseControl?: boolean

  @Expose()
  @ApiPropertyOptional()
  interniInPelle?: boolean

  @Expose()
  @ApiPropertyOptional()
  cerchiInLega?: boolean

  @Expose()
  @ApiPropertyOptional()
  inVetrina?: boolean

  @Expose()
  @ApiPropertyOptional()
  pubblicata?: boolean
}
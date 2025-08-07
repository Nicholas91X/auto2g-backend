import { ApiPropertyOptional } from "@nestjs/swagger"
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator"
import { Type } from "class-transformer"
import { TipoCarburanteEnum } from "../enums/tipoCarburanteEnum"
import { Carburante, TipoDiCambio, Trazione } from "@prisma/client"
import { TipoCambioEnum } from "../enums/tipoCambioEnum"
import { TipoTrazioneEnum } from "../enums/tipoTrazioneEnum"

export class UpdateAutoUsataDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  modello?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targa?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  anno?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  prezzo?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  km?: number;

  @ApiPropertyOptional({
    enum: TipoCarburanteEnum,
    example: TipoCarburanteEnum.BENZINA,
  })
  @IsEnum(TipoCarburanteEnum)
  @IsOptional()
  carburante?: Carburante

  @ApiPropertyOptional({ example: 1200 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  cilindrata?: number

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  potenzaCV?: number

  @ApiPropertyOptional({ example: 74 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  potenzaKW?: number

  @ApiPropertyOptional({
    enum: TipoCambioEnum,
    example: TipoCambioEnum.MANUALE,
  })
  @IsEnum(TipoCambioEnum)
  @IsOptional()
  tipoDiCambio?: TipoDiCambio

  @ApiPropertyOptional({
    enum: TipoTrazioneEnum,
    example: TipoTrazioneEnum.ANTERIORE,
  })
  @IsEnum(TipoTrazioneEnum)
  @IsOptional()
  trazione?: Trazione

  @ApiPropertyOptional({ example: "Euro 6" })
  @IsString()
  @IsOptional()
  classeEmissione?: string

  @ApiPropertyOptional({ example: "Grigio Metallizzato" })
  @IsString()
  @IsOptional()
  coloreEsterno?: string

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  numeroPorte?: number

  @ApiPropertyOptional({ example: 4 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  numeroPosti?: number

  @ApiPropertyOptional({
    description: "Descrizione libera e note sull'auto",
  })
  @IsString()
  @IsOptional()
  descrizione?: string

  @ApiPropertyOptional({
    description: "Note sugli optional non standard",
  })
  @IsString()
  @IsOptional()
  noteOptional?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  abs?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  airbag?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  climatizzatore?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  servosterzo?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  navigatore?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  sensoriParcheggio?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  cruiseControl?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  interniInPelle?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  cerchiInLega?: boolean
}
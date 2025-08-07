import { ApiPropertyOptional } from "@nestjs/swagger"
import { AutoUsataStatus } from "@prisma/client"
import { Type } from "class-transformer"
import {
  IsEnum, IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator"

export class FiltroAutoUsataDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  marca?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  modello?: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  prezzoMin?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  prezzoMax?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  annoDa?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  kmMax?: number;

  @ApiPropertyOptional({ enum: AutoUsataStatus })
  @IsEnum(AutoUsataStatus)
  @IsOptional()
  stato?: AutoUsataStatus
}

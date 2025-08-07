import { ApiPropertyOptional } from "@nestjs/swagger"
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Type } from "class-transformer"

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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descrizione?: string;
}
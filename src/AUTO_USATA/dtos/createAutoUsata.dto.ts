import { ApiProperty } from "@nestjs/swagger"
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator"
import { Type } from "class-transformer"

export class CreateAutoUsataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  marca: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  modello: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targa: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  anno: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prezzo: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  km: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descrizione?: string;
}
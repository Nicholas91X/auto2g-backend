import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { Type } from "class-transformer"

export class UpdateVenditaDto {
  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  prezzoFinale?: number

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  acquirenteId?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  acquirenteNomeCognome?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  acquirenteInfo?: string
}

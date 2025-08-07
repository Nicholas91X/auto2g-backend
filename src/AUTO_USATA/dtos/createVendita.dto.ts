import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from "class-validator"
import { Type } from "class-transformer"

export class CreateVenditaDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  autoId: number

  @ApiPropertyOptional({
    description: "ID dell'account se l'acquirente è registrato",
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  acquirenteId?: number

  @ApiProperty({
    description: "Nome e cognome se l'acquirente non è registrato",
  })
  @ValidateIf((o) => !o.acquirenteId)
  @IsString()
  @IsNotEmpty()
  acquirenteNomeCognome?: string

  @ApiPropertyOptional({
    description: "Contatti o note sull'acquirente non registrato",
  })
  @IsString()
  @IsOptional()
  acquirenteInfo?: string

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prezzoFinale: number
}

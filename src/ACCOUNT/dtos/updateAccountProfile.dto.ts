import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, MinLength } from "class-validator"

export class UpdateAccountProfileDto {
  @ApiProperty({ example: "Mario", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @ApiProperty({ example: "Rossi", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  surname?: string

  @ApiProperty({ example: "+393331234567", required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string

  @ApiProperty({ example: "+RMTNHB90V34C031Y", required: false })
  @IsOptional()
  @IsString()
  fiscalCode?: string
}
import { IsEmail, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateAccountAdminDto {
  @ApiProperty({
    description: "Indirizzo email User",
    example: "romitinicholas@gmail.com",
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: "Nome User",
    example: "Nicholas",
  })
  @IsString()
  name: string

  @ApiProperty({
    description: "Cognome User",
    example: "Romiti",
  })
  @IsString()
  surname: string

  @ApiProperty({
    description: "Numero di telefono User",
    example: "3201234567890",
  })
  @IsString()
  @IsOptional()
  phoneNumber: string | null
}
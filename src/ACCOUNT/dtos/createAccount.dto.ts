import { IsEmail, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateAccountDto {
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
  phoneNumber: string

  @ApiProperty({
    description: "Password User",
    example: "nico84397",
  })
  @IsString()
  password: string
}
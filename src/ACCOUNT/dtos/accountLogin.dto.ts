import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString } from "class-validator"
import { Transform } from "class-transformer"

export class AccountLoginDto {
  @ApiProperty({
    example: "romitinicholas91hotmail.it",
    description: "Email dell'account per il login",
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string

  @ApiProperty({
    example: "nico84397",
    description: "Password dell'account",
  })
  @IsString()
  password: string
}
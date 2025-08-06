import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString } from "class-validator"
import { Transform } from "class-transformer"

export class AccountLoginDto {
  @ApiProperty({
    example: "account@example.com",
    description: "Email dell'account per il login",
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string

  @ApiProperty({
    example: "yourSecurePassword123!",
    description: "Password dell'account",
  })
  @IsString()
  password: string
}
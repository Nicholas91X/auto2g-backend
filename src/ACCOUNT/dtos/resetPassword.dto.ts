import { IsString, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ResetPasswordDto {
  @ApiProperty({
    description:
      "La nuova password da impostare. Deve contenere almeno 6 caratteri.",
    example: "newStrongPassword123",
  })
  @IsString()
  @MinLength(6)
  newPassword: string

  @ApiProperty({
    description: "Token JWT ricevuto via email per autorizzare il reset.",
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  token: string
}
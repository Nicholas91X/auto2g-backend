import { IsEmail } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class RequestPasswordResetDto {
  @ApiProperty({
    description:
      "Email associata all’account per richiedere il reset della password",
    example: "user@example.com",
  })
  @IsEmail()
  email: string
}
import { IsEmail, IsNotEmpty } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateEmailDto {
  @ApiProperty({
    description: "Nuovo indirizzo email da associare all’account",
    example: "nuovo@email.com",
  })
  @IsEmail()
  @IsNotEmpty()
  newEmail: string
}
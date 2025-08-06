import { IsNotEmpty, IsString, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdatePasswordDto {
  @ApiProperty({
    description: "Password attuale dell’utente",
    example: "VecchiaPassword123",
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string

  @ApiProperty({
    description: "Nuova password da impostare (min. 6 caratteri)",
    example: "NuovaPassword456",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string
}
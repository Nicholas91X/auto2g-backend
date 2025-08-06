import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateSellerDto {
  @ApiProperty({
    description: "Il nome di battesimo del venditore.",
    example: 'Guido',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Il cognome del venditore.",
    example: 'Lavespa',
  })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({
    description:
      "L'indirizzo email del venditore. Verrà usato per il login e le comunicazioni.",
    example: 'guido.lavespa@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Il numero di telefono di contatto del venditore.",
    example: '+393331234567',
  })
  @IsString()
  @IsOptional()
  phoneNumber: string;
}
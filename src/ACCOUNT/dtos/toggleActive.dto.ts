import { IsBoolean } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ToggleActiveDto {
  @ApiProperty({
    description:
      "Determina se un account debba essere attivo (true) o non attivo (false)",
  })
  @IsBoolean()
  active: boolean
}
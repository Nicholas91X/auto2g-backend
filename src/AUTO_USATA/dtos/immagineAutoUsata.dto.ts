import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"

export class ImmagineAutoDto {
  @Expose()
  @ApiProperty()
  id: number

  @Expose()
  @ApiProperty({ example: "uploads/auto_usata/auto-1-targa-AA123BB.jpg" })
  url: string
}

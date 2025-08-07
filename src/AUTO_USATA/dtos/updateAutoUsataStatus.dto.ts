import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty } from "class-validator"
import { AutoUsataStatus } from "@prisma/client"

export class UpdateAutoUsataStatoDto {
  @ApiProperty({
    enum: AutoUsataStatus,
    description: "Il nuovo stato dell'auto",
    example: AutoUsataStatus.IN_TRATTATIVA,
  })
  @IsEnum(AutoUsataStatus)
  @IsNotEmpty()
  stato: AutoUsataStatus
}

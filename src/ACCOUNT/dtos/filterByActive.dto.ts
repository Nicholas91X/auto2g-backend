import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsBoolean } from "class-validator"

export class FilterByActiveDto {
  @ApiProperty({ type: Boolean })
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  active: boolean
}

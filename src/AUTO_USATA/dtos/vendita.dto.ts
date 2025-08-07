import { ApiProperty } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { AccountInfoDto } from "../../ACCOUNT/dtos/accountInfo.dto"
import { AutoUsataDto } from "./autoUsata.dto"

export class VenditaDto {
  @Expose()
  @ApiProperty()
  id: number

  @Expose()
  @ApiProperty()
  dataVendita: Date

  @Expose()
  @ApiProperty()
  prezzoFinale: number

  @Expose()
  @ApiProperty()
  acquirenteNomeCognome: string

  @Expose()
  @ApiProperty({ required: false })
  acquirenteInfo: string | null

  @Expose()
  @ApiProperty({ type: () => AutoUsataDto })
  @Type(() => AutoUsataDto)
  auto: AutoUsataDto

  @Expose()
  @ApiProperty({ type: () => AccountInfoDto, required: false })
  @Type(() => AccountInfoDto)
  acquirente?: AccountInfoDto
}

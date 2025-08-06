import { ApiProperty } from "@nestjs/swagger"
import { AccountRole } from "@prisma/client"
import { Expose, Type } from "class-transformer"
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator"
import { AccountRoleEnum } from '../enums/accountRoleEnum';

export class AccountInfoDto {
  @Expose()
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number

  @Expose()
  @ApiProperty({ example: "mario.rossi@example.com" })
  @IsString()
  @IsNotEmpty()
  email: string

  @Expose()
  @ApiProperty({ example: "+393331234567" })
  @IsOptional()
  @IsString()
  phoneNumber: string | null

  @Expose()
  @ApiProperty({ example: "Mario" })
  @IsString()
  @IsNotEmpty()
  name: string

  @Expose()
  @ApiProperty({ example: "Rossi" })
  @IsString()
  @IsNotEmpty()
  surname: string

  @Expose()
  @ApiProperty({ enum: AccountRole, example: AccountRoleEnum.CUSTOMER })
  @IsEnum(AccountRoleEnum)
  role: AccountRole

  @Expose()
  @ApiProperty({ example: "https://…/avatar.png", required: false })
  @IsOptional()
  @IsString()
  profilePicture: string | null
  @Expose()

  @Expose()
  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean

  @Expose()
  @ApiProperty({ example: false })
  @IsBoolean()
  verified: boolean

  @Expose()
  @ApiProperty({ type: String, format: "date-time" })
  @IsDate()
  @Type(() => Date)
  createdAt: Date

  @Expose()
  @ApiProperty({ type: String, format: "date-time" })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date | null
}
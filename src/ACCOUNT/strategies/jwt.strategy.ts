import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as fs from "fs"
import { Request } from "express"
import { AccountRepository } from "../repositories/account.repository"
import { JwtAccountPayload } from "../dtos/jwtAccountPayload.dto"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt-token") {
  constructor(
    private readonly accountRepository: AccountRepository,
    configService: ConfigService,
  ) {
    super({
      //  function that takes request and returns the token
      //  either from the cookies (as session) or from header
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.fromCookies,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),

      //  To verify the signature we need the public key
      secretOrKey: fs
        .readFileSync(configService.get<string>("JWT_PUBLIC_KEY_FILE", ""))
        .toString(),
      // secretOrKey: publicKey,
      ignoreExpiration: false,
      algorithms: ["RS256"],
    })
  }

  async validate(payload: JwtAccountPayload) {
    if (!payload.active) {
      throw new UnauthorizedException("Inactive account")
    }
    const account = await this.accountRepository.findById(payload.id)
    if (!account || !account.active) throw new UnauthorizedException()
    return account
  }

  private static fromCookies(req: Request): string | null {
    return req.cookies?.session ?? null
  }
}

import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

/**
 * Passport strategy for validating JWTs signed by ms-auth.
 * Uses the same shared symmetric JWT_SECRET as ms-auth.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {
    // Return whatever is needed in request.user
    return { userId: payload.sub, email: payload.email };
  }
}

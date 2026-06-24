/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // We tell it how to extract the token (from the Authorization header)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Same secret we used to sign the token!
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // If the token is valid, NestJS calls this method automatically
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}

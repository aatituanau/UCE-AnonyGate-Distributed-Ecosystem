import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_SUPER_SAFE_2026',
    });
  }

  async validate(payload: any) {
    // This payload is the decoded JWT.
    // The distributed ms-auth creates JWTs with sub, username, and role.
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}

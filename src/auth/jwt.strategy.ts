/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // TypeScript workaround: forzamos el tipo para evitar errores de tipado con ExtractJwt
      jwtFromRequest: (ExtractJwt.fromAuthHeaderAsBearerToken as unknown as () => () => string)(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
    });
  }

  validate(payload: JwtPayload): { userId: number; email: string; role: string } {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}

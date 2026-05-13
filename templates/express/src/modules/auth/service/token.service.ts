import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { JwtPayload } from '../interfaces/auth.interface';

export class TokenService {
  signAccess(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRATION });
  }

  signRefresh(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRATION });
  }

  signEmailVerification(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EMAIL_VERIFICATION_EXPIRATION });
  }

  signResetPassword(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_RESET_PASSWORD_EXPIRATION });
  }

  verify<T>(token: string): T {
    return jwt.verify(token, env.JWT_SECRET) as T;
  }
}

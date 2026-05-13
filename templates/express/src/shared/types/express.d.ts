import type { JwtPayload } from '@modules/auth/interfaces/auth.interface';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: JwtPayload;
    }
  }
}

export {};

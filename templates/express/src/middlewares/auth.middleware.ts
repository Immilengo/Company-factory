import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { AppError } from '@errors/app-error';
import { JwtPayload } from '@modules/auth/interfaces/auth.interface';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization) throw new AppError('Missing authorization header', 401);

  const [type, token] = authorization.split(' ');
  if (type !== 'Bearer' || !token) throw new AppError('Invalid authorization header', 401);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new AppError('Invalid token', 401);
  }
};

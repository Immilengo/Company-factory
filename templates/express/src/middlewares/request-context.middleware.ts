import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export const requestContextMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.requestId = randomUUID();
  next();
};

import { NextFunction, Request, Response } from 'express';

// Placeholder for future fine-grained permission checks.
export const permissionsMiddleware = (_permissions: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};

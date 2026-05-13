import { NextFunction, Request, Response } from 'express';
import { AppError } from '@errors/app-error';

export const rolesMiddleware = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles ?? [];
    const hasRole = userRoles.some((role) => roles.includes(role));
    if (!hasRole) throw new AppError('Forbidden', 403);
    next();
  };
};

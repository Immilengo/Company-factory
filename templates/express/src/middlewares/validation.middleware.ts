import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '@errors/app-error';

export const validationMiddleware = <T>(schema: ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new AppError('Validation error', 422, result.error.issues);
    }
    req.body = result.data;
    next();
  };
};

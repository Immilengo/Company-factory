import { NextFunction, Request, Response } from 'express';
import { AppError } from '@errors/app-error';
import { logger } from '@utils/logger';
import { errorResponse } from '@utils/response';

export const errorMiddleware = (error: Error, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    logger.warn({ requestId: req.requestId, message: error.message, errors: error.errors });
    return res.status(error.statusCode).json(errorResponse(error.message, error.errors));
  }

  logger.error({ requestId: req.requestId, message: error.message, stack: error.stack });
  return res.status(500).json(errorResponse('Internal server error'));
};

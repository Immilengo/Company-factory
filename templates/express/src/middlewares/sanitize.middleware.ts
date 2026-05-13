import { NextFunction, Request, Response } from 'express';

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replace(/[<>]/g, '');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }

  return value;
};

export const sanitizeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.body = sanitizeValue(req.body) as Record<string, unknown>;

  const sanitizedQuery = sanitizeValue(req.query) as Record<string, unknown>;
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      delete (req.query as Record<string, unknown>)[key];
    }
    Object.assign(req.query as Record<string, unknown>, sanitizedQuery);
  }

  next();
};

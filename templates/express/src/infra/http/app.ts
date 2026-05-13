import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from '@config/env';
import { swaggerSpec } from '@config/swagger';
import { errorMiddleware } from '@middlewares/error.middleware';
import { requestContextMiddleware } from '@middlewares/request-context.middleware';
import { requestLoggerMiddleware } from '@middlewares/request-logger.middleware';
import { sanitizeMiddleware } from '@middlewares/sanitize.middleware';
import { router } from '@shared/router';

const app = express();
const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalOrigin = (origin: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
const isWildcardLocalRule = (rule: string) => /^https?:\/\/(localhost|127\.0\.0\.1):\*$/i.test(rule);
const isWildcardRule = (rule: string) => rule === '*';
const isExactMatch = (origin: string, rule: string) => origin === rule;

const isOriginAllowed = (origin: string) =>
  allowedOrigins.some((rule) => {
    if (isWildcardRule(rule)) return true;
    if (isWildcardLocalRule(rule) && isLocalOrigin(origin)) return true;
    return isExactMatch(origin, rule);
  });

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);
app.use(requestContextMiddleware);
app.use(requestLoggerMiddleware);

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'healthy', data: { uptime: process.uptime() } });
});

app.get('/actuator/health', (_req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(router);
app.use(errorMiddleware);

export { app };

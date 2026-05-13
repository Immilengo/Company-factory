import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('Mayongi Enterprise Backend'),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  APP_VERSION: z.string().default('1.0.0'),
  APP_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRATION: z.string().default('3600000'),
  JWT_REFRESH_EXPIRATION: z.string().default('86400000'),
  JWT_EMAIL_VERIFICATION_EXPIRATION: z.string().default('1d'),
  JWT_RESET_PASSWORD_EXPIRATION: z.string().default('1h'),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().int().positive(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number().int().positive(),
  MAIL_USERNAME: z.string().default(''),
  MAIL_PASSWORD: z.string().default(''),
  MAIL_FROM: z.string().default('noreply@company.com'),
  CORS_ALLOWED_ORIGINS: z.string().default('*'),
  DEFAULT_ADMIN_EMAIL: z.string().email().default('admin@company.com'),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default('Admin123@')
});

const normalizedEnv = {
  ...process.env,
  MAIL_USERNAME: process.env.MAIL_USERNAME ?? process.env.MAIL_USER ?? ''
};

const parsed = envSchema.safeParse(normalizedEnv);

if (!parsed.success) {
  throw new Error(`Environment validation error: ${parsed.error.message}`);
}

export const env = parsed.data;
export const databaseUrl = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}?schema=public`;

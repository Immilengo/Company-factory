import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { databaseUrl } from '@config/env';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error']
});

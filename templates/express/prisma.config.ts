import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const databaseUrlFromEnv = process.env.DATABASE_URL;
const fallbackUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`;
const url =
  databaseUrlFromEnv && databaseUrlFromEnv.startsWith('postgresql://')
    ? databaseUrlFromEnv
    : fallbackUrl;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url
  }
});

import { app } from '@infra/http/app';
import { env } from '@config/env';
import { prisma } from '@infra/database/prisma';
import { redisClient } from '@infra/cache/redis';
import { logger } from '@utils/logger';
import { bootstrapAdmin } from '@modules/auth/service/bootstrap-admin.service';

const server = app.listen(env.APP_PORT, async () => {
  try {
    logger.info({ message: `Startup: ${env.APP_NAME} on port ${env.APP_PORT}` });
    await prisma.$connect();
    await redisClient.connect();
    await bootstrapAdmin();
    logger.info({ message: 'Dependencies connected successfully' });
  } catch (error) {
    logger.error({
      message: 'Startup failed while connecting dependencies',
      error: error instanceof Error ? error.message : String(error)
    });
    server.close(async () => {
      try {
        await prisma.$disconnect();
      } catch {
        // ignore shutdown errors
      }
      if (redisClient.isOpen) {
        try {
          await redisClient.disconnect();
        } catch {
          // ignore shutdown errors
        }
      }
      process.exit(1);
    });
  }
});

const shutdown = async (signal: string) => {
  logger.info({ message: `Graceful shutdown started`, signal });
  server.close(async () => {
    await prisma.$disconnect();
    if (redisClient.isOpen) await redisClient.disconnect();
    logger.info({ message: 'Server closed successfully' });
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

import { createClient } from 'redis';
import { env } from '@config/env';
import { logger } from '@utils/logger';

export const redisClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT
  }
});

redisClient.on('error', (error) => {
  logger.error({ message: 'Redis client error', error: error.message });
});

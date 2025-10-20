import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(
      {
        port: env.PORT,
        host: env.HOST,
        environment: env.NODE_ENV,
      },
      'Analytics Service started successfully'
    );

    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info({ signal }, 'Shutting down gracefully');
        await app.close();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start analytics service');
    process.exit(1);
  }
}

start();

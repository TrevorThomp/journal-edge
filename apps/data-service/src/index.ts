import { buildApp } from './app.js';
import { env } from './config/env.js';

/**
 * Start the Data Service server
 */
async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(
      `🚀 Data Service started on ${env.HOST}:${env.PORT} in ${env.NODE_ENV} mode`
    );
    app.log.info(`📊 Available routes:`);
    app.log.info(`   - POST   /api/trades`);
    app.log.info(`   - GET    /api/trades`);
    app.log.info(`   - GET    /api/trades/:id`);
    app.log.info(`   - PUT    /api/trades/:id`);
    app.log.info(`   - DELETE /api/trades/:id`);
    app.log.info(`   - POST   /api/trades/import`);
    app.log.info(`   - POST   /api/tags`);
    app.log.info(`   - GET    /api/tags`);
    app.log.info(`   - GET    /api/tags/:id`);
    app.log.info(`   - PUT    /api/tags/:id`);
    app.log.info(`   - DELETE /api/tags/:id`);
    app.log.info(`   - GET    /api/calendar?year=YYYY&month=MM`);
    app.log.info(`   - GET    /api/calendar/:date`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

start();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { analyticsRoutes } from './routes/analytics.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: logger,
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    trustProxy: true,
    bodyLimit: 1048576,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  await app.register(cors, {
    origin: (origin, cb) => {
      const allowedOrigins = env.CORS_ORIGIN;
      if (!origin) {
        cb(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIMEWINDOW,
    cache: 10000,
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: () => ({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      statusCode: 429,
    }),
  });

  app.setErrorHandler(errorHandler);

  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'analytics-service',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });

  await app.register(analyticsRoutes, { prefix: '/analytics' });

  app.setNotFoundHandler((request, reply) => {
    logger.warn({ url: request.url, method: request.method }, 'Route not found');
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  return app;
}

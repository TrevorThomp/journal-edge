import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import type { BaseEnv } from '../config/env.js';
import { createLogger } from '../config/logger.js';
import { createErrorHandler } from '../middleware/errorHandler.js';

export interface CreateAppOptions {
  env: BaseEnv;
  serviceName: string;
  bodyLimit?: number;
}

/**
 * Creates and configures a Fastify application with common security features
 *
 * Security features:
 * - CORS with strict origin validation
 * - Security headers via Helmet
 * - Rate limiting to prevent brute force attacks
 * - Request body size limits
 * - Comprehensive error handling
 * - Structured logging with sensitive data redaction
 */
export async function createApp(options: CreateAppOptions) {
  const { env, serviceName, bodyLimit = 10485760 } = options; // 10MB default

  const logger = createLogger(env.LOG_LEVEL, env.NODE_ENV);

  const app = Fastify({
    logger: logger,
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    trustProxy: true,
    bodyLimit,
    ajv: {
      customOptions: {
        removeAdditional: 'all', // Remove additional properties not in schema
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  // Register security headers plugin
  // Helmet sets various HTTP headers for security
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

  // Register CORS plugin
  // Strict origin validation from environment config
  await app.register(cors, {
    origin: (origin, cb) => {
      const allowedOrigins = env.CORS_ORIGIN;

      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        cb(null, true);
        return;
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }

      // Reject unauthorized origins
      cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Register rate limiting plugin
  // Prevents brute force attacks
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIMEWINDOW,
    cache: 10000, // Cache up to 10k different IPs
    keyGenerator: (req) => {
      // Use IP address as rate limit key
      return req.ip;
    },
    errorResponseBuilder: () => ({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      statusCode: 429,
    }),
  });

  // Global error handler
  app.setErrorHandler(createErrorHandler(logger, env.NODE_ENV));

  // Health check endpoint (no auth required)
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: serviceName,
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    logger.warn({ url: request.url, method: request.method }, 'Route not found');
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  return app;
}

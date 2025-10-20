import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';

/**
 * Creates and configures the Fastify authentication service
 *
 * Security features:
 * - CORS with strict origin validation
 * - Security headers via Helmet
 * - Rate limiting to prevent brute force attacks
 * - Request body size limits
 * - Comprehensive error handling
 * - Structured logging with sensitive data redaction
 */
export async function buildApp() {
  const app = Fastify({
    logger: logger,
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    trustProxy: true,
    bodyLimit: 1048576, // 1MB max request body (smaller for auth service)
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
  // Prevents brute force attacks on authentication endpoints
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
  app.setErrorHandler(errorHandler);

  // Health check endpoint (no auth required)
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });

  // Register authentication routes
  await app.register(authRoutes, { prefix: '/auth' });

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

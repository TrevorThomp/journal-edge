import pino from 'pino';
import { env } from './env.js';

/**
 * Pino logger configuration
 * Configured to redact sensitive data from logs
 *
 * Security features:
 * - Redacts authorization headers, cookies, passwords, and tokens
 * - Removes sensitive fields completely from logs
 * - Pretty printing in development for readability
 * - JSON logs in production for log aggregation
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'access_token',
      'refresh_token',
    ],
    remove: true,
  },
  transport: env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

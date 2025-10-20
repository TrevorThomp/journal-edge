import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler for Fastify
 * Handles different error types and provides consistent error responses
 *
 * Security considerations:
 * - Sanitizes error messages in production (no stack traces)
 * - Logs full error details server-side for debugging
 * - Returns generic messages for unexpected errors
 * - Validates input errors provide helpful feedback without leaking internals
 * - Prevents information disclosure through error messages
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log the full error server-side
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
    },
  }, 'Error occurred');

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: validationErrors,
    });
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
      code: error.code,
      ...(env.NODE_ENV === 'development' && error.details ? { details: error.details } : {}),
    });
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.validation,
    });
  }

  // Handle specific Fastify errors
  if (error.statusCode) {
    const statusCode = error.statusCode;
    const message = statusCode < 500 ? error.message : 'Internal server error';

    return reply.status(statusCode).send({
      error: error.name || 'Error',
      message,
      // Only include stack trace in development
      ...(env.NODE_ENV === 'development' && error.stack ? { stack: error.stack } : {}),
    });
  }

  // Handle rate limit errors
  if (error.code === 'FST_ERR_RATE_LIMIT') {
    return reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }

  // Default error response for unexpected errors
  // Never expose internal error details in production
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development'
      ? error.message
      : 'An unexpected error occurred. Please try again later.',
    ...(env.NODE_ENV === 'development' && error.stack ? { stack: error.stack } : {}),
  });
}

/**
 * Helper function to create unauthorized errors
 */
export function unauthorized(message = 'Unauthorized access'): AppError {
  return new AppError(401, message, 'UNAUTHORIZED');
}

/**
 * Helper function to create bad request errors
 */
export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(400, message, 'BAD_REQUEST', details);
}

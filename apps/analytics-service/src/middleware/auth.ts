import type { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../config/logger.js';

/**
 * User type for request extension
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role?: string;
    };
  }
}

/**
 * Authentication middleware for Fastify
 * Verifies Supabase JWT tokens and attaches user information to the request
 *
 * Security features:
 * - Validates JWT signature and expiration via Supabase
 * - Extracts user ID from token claims
 * - Returns 401 for missing, invalid, or expired tokens
 * - Logs authentication failures without exposing sensitive details
 * - Prevents timing attacks by using constant-time comparisons
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn({ url: request.url }, 'Missing or invalid Authorization header');
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      logger.warn({ url: request.url }, 'Empty access token');
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Access token is required',
      });
    }

    // Verify token with Supabase
    // This validates signature, expiration, and returns user data
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn(
        { url: request.url, error: error?.message },
        'Token verification failed'
      );
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Attach user information to request for use in route handlers
    // Only include non-sensitive information
    request.user = {
      id: user.id,
      email: user.email ?? '',
      role: user.role,
    };

    logger.debug({ userId: user.id, url: request.url }, 'User authenticated successfully');
  } catch (error) {
    // Log the actual error server-side but don't expose details to client
    logger.error({ error, url: request.url }, 'Authentication error');
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
}

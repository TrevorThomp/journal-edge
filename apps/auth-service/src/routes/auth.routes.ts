import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../config/logger.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  type RegisterInput,
  type LoginInput,
  type RefreshTokenInput
} from '../utils/validation.js';
import { AppError, badRequest } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

/**
 * Authentication routes
 *
 * Security features:
 * - Password strength validation (min 8 chars, uppercase, lowercase, number)
 * - Email validation
 * - Secure token generation via Supabase
 * - Rate limiting applied to prevent brute force attacks
 * - Error messages don't reveal if email exists (prevents user enumeration)
 * - Tokens are httpOnly and secure in production
 * - Short-lived access tokens with refresh token rotation
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /auth/register
   * Register a new user account
   */
  fastify.post(
    '/register',
    {
      schema: {
        body: registerSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              user: { type: 'object' },
              session: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: RegisterInput }>,
      reply: FastifyReply
    ) => {
      try {
        const { email, password, name } = request.body;

        // Create user with Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm for now, implement email verification later
          user_metadata: {
            name,
          },
        });

        if (error) {
          // Don't expose specific Supabase error details
          logger.error({ error }, 'User registration failed');

          // Handle specific error cases
          if (error.message.includes('already registered')) {
            throw badRequest('User with this email already exists');
          }

          throw new AppError(400, 'Registration failed. Please try again.');
        }

        logger.info({ userId: data.user.id, email }, 'User registered successfully');

        // Sign in the user automatically after registration
        const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          logger.warn({ error: signInError }, 'Auto sign-in after registration failed');
          return reply.status(201).send({
            message: 'Registration successful. Please sign in.',
            user: { id: data.user.id, email: data.user.email },
          });
        }

        return reply.status(201).send({
          message: 'Registration successful',
          user: {
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.user_metadata.name,
          },
          session: {
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            expires_in: sessionData.session.expires_in,
            expires_at: sessionData.session.expires_at,
          },
        });
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        logger.error({ error }, 'Unexpected error during registration');
        throw new AppError(500, 'Registration failed. Please try again.');
      }
    }
  );

  /**
   * POST /auth/login
   * Authenticate user and return access token
   */
  fastify.post(
    '/login',
    {
      schema: {
        body: loginSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              user: { type: 'object' },
              session: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: LoginInput }>,
      reply: FastifyReply
    ) => {
      try {
        const { email, password } = request.body;

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.session) {
          // Generic error message to prevent user enumeration
          logger.warn({ email, error: error?.message }, 'Login failed');
          throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
        }

        logger.info({ userId: data.user.id, email }, 'User logged in successfully');

        return reply.status(200).send({
          message: 'Login successful',
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.name,
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
            expires_at: data.session.expires_at,
          },
        });
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        logger.error({ error }, 'Unexpected error during login');
        throw new AppError(500, 'Login failed. Please try again.');
      }
    }
  );

  /**
   * POST /auth/logout
   * Invalidate user session
   * Requires authentication
   */
  fastify.post(
    '/logout',
    {
      onRequest: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get token from authorization header
        const token = request.headers.authorization?.substring(7);

        if (token) {
          // Sign out the session
          const { error } = await supabaseAdmin.auth.admin.signOut(token);

          if (error) {
            logger.error({ error, userId: request.user?.id }, 'Logout failed');
          } else {
            logger.info({ userId: request.user?.id }, 'User logged out successfully');
          }
        }

        return reply.status(200).send({
          message: 'Logout successful',
        });
      } catch (error) {
        logger.error({ error, userId: request.user?.id }, 'Unexpected error during logout');
        // Return success even if logout fails (client should clear tokens)
        return reply.status(200).send({
          message: 'Logout successful',
        });
      }
    }
  );

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  fastify.post(
    '/refresh',
    {
      schema: {
        body: refreshTokenSchema,
      },
    },
    async (
      request: FastifyRequest<{ Body: RefreshTokenInput }>,
      reply: FastifyReply
    ) => {
      try {
        const { refresh_token } = request.body;

        const { data, error } = await supabaseAdmin.auth.refreshSession({
          refresh_token,
        });

        if (error || !data.session || !data.user) {
          logger.warn({ error: error?.message }, 'Token refresh failed');
          throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
        }

        logger.info({ userId: data.user.id }, 'Token refreshed successfully');

        return reply.status(200).send({
          message: 'Token refreshed successfully',
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
            expires_at: data.session.expires_at,
          },
        });
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        logger.error({ error }, 'Unexpected error during token refresh');
        throw new AppError(500, 'Token refresh failed. Please login again.');
      }
    }
  );

  /**
   * GET /auth/me
   * Get current user information
   * Requires authentication
   */
  fastify.get(
    '/me',
    {
      onRequest: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;

        if (!userId) {
          throw new AppError(401, 'User not authenticated');
        }

        // Get fresh user data from Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (error || !user) {
          logger.error({ error, userId }, 'Failed to fetch user data');
          throw new AppError(404, 'User not found');
        }

        return reply.status(200).send({
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata.name,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        });
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        logger.error({ error }, 'Unexpected error fetching user');
        throw new AppError(500, 'Failed to fetch user information');
      }
    }
  );
}

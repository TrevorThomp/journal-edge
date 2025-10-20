import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createUserClient } from '../config/supabase.js';
import { logger } from '../config/logger.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Database } from '@journal-edge/db';

/**
 * Analytics routes
 *
 * Calculates trading performance metrics and analytics
 * All routes require authentication and use RLS for data scoping
 */
export async function analyticsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /analytics/metrics
   * Calculate overall trading metrics
   */
  fastify.get(
    '/metrics',
    {
      onRequest: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          throw new AppError(401, 'Unauthorized');
        }

        const token = request.headers.authorization?.substring(7) || '';
        const supabase = createUserClient(token);

        // Fetch all trades for the user
        const { data: trades, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          logger.error({ error, userId }, 'Failed to fetch trades for metrics');
          throw new AppError(500, 'Failed to calculate metrics');
        }

        // Type-safe trades array
        type Trade = Database['public']['Tables']['trades']['Row'];
        const tradeList: Trade[] = trades || [];

        // Calculate metrics (placeholder - implement actual calculations)
        const totalTrades = tradeList.length;
        const winningTrades = tradeList.filter(t => t.pnl > 0).length;
        const losingTrades = tradeList.filter(t => t.pnl < 0).length;
        const totalPnl = tradeList.reduce((sum, t) => sum + t.pnl, 0);

        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

        return reply.status(200).send({
          metrics: {
            total_trades: totalTrades,
            winning_trades: winningTrades,
            losing_trades: losingTrades,
            win_rate: winRate,
            total_pnl: totalPnl,
            // Add more metrics: profit_factor, expectancy, sharpe_ratio, etc.
          },
        });
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        logger.error({ error }, 'Unexpected error calculating metrics');
        throw new AppError(500, 'Failed to calculate metrics');
      }
    }
  );

  /**
   * GET /analytics/by-day-of-week
   * Analyze performance by day of week
   */
  fastify.get(
    '/by-day-of-week',
    {
      onRequest: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          throw new AppError(401, 'Unauthorized');
        }

        // Placeholder implementation
        return reply.status(200).send({
          message: 'Day of week analytics to be implemented',
          data: [],
        });
      } catch (error) {
        logger.error({ error }, 'Unexpected error in day-of-week analytics');
        throw new AppError(500, 'Failed to calculate analytics');
      }
    }
  );

  /**
   * GET /analytics/by-hour
   * Analyze performance by hour of day
   */
  fastify.get(
    '/by-hour',
    {
      onRequest: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          throw new AppError(401, 'Unauthorized');
        }

        // Placeholder implementation
        return reply.status(200).send({
          message: 'Hour analytics to be implemented',
          data: [],
        });
      } catch (error) {
        logger.error({ error }, 'Unexpected error in hour analytics');
        throw new AppError(500, 'Failed to calculate analytics');
      }
    }
  );

  /**
   * GET /analytics/by-tag
   * Analyze performance by tag
   */
  fastify.get(
    '/by-tag',
    {
      onRequest: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          throw new AppError(401, 'Unauthorized');
        }

        // Placeholder implementation
        return reply.status(200).send({
          message: 'Tag analytics to be implemented',
          data: [],
        });
      } catch (error) {
        logger.error({ error }, 'Unexpected error in tag analytics');
        throw new AppError(500, 'Failed to calculate analytics');
      }
    }
  );

  /**
   * GET /analytics/equity-curve
   * Generate equity curve data
   */
  fastify.get(
    '/equity-curve',
    {
      onRequest: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          throw new AppError(401, 'Unauthorized');
        }

        // Placeholder implementation
        return reply.status(200).send({
          message: 'Equity curve to be implemented',
          data: [],
        });
      } catch (error) {
        logger.error({ error }, 'Unexpected error generating equity curve');
        throw new AppError(500, 'Failed to generate equity curve');
      }
    }
  );

  /**
   * GET /analytics/symbols
   * Get symbol-level statistics
   */
  fastify.get(
    '/symbols',
    {
      onRequest: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          throw new AppError(401, 'Unauthorized');
        }

        // Placeholder implementation
        return reply.status(200).send({
          message: 'Symbol analytics to be implemented',
          data: [],
        });
      } catch (error) {
        logger.error({ error }, 'Unexpected error in symbol analytics');
        throw new AppError(500, 'Failed to calculate symbol analytics');
      }
    }
  );
}

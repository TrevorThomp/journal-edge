import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Database } from '@journal-edge/db';
import { createUserClient, AppError } from '@journal-edge/fastify-framework';
import { env } from '../config/env.js';

type Trade = Database['public']['Tables']['trades']['Row'];

/**
 * Calendar routes
 *
 * Provides calendar view and date-based trade aggregations
 */
export async function calendarRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /calendar
   * Get calendar view of trades for a specific month
   */
  fastify.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            year: { type: 'string' },
            month: { type: 'string' },
          },
          required: ['year', 'month'],
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: { year: string; month: string } }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const { year, month } = request.query;
      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      // Calculate month start and end dates
      const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthEnd = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .gte('trade_date', monthStart.toISOString())
        .lte('trade_date', monthEnd.toISOString())
        .order('trade_date', { ascending: true })
        .returns<Trade[]>();

      if (error) {
        fastify.log.error({ error, userId }, 'Failed to fetch calendar data');
        throw new AppError(500, 'Failed to fetch calendar data');
      }

      // Group trades by day
      const tradeList: Trade[] = trades || [];
      const calendarData: Record<string, any> = {};
      tradeList.forEach(trade => {
        const date = new Date(trade.trade_date).toISOString().split('T')[0];
        if (!calendarData[date]) {
          calendarData[date] = {
            date,
            trades: [],
            total_pnl: 0,
            trade_count: 0,
          };
        }
        calendarData[date].trades.push(trade);
        calendarData[date].total_pnl += trade.pnl || 0;
        calendarData[date].trade_count += 1;
      });

      return reply.status(200).send({
        year,
        month,
        calendar: Object.values(calendarData),
      });
    }
  );

  /**
   * GET /calendar/:date
   * Get detailed trades for a specific date
   */
  fastify.get(
    '/:date',
    async (
      request: FastifyRequest<{ Params: { date: string } }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const { date } = request.params;
      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      // Parse date and create date range for the day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .gte('trade_date', dayStart.toISOString())
        .lte('trade_date', dayEnd.toISOString())
        .order('trade_date', { ascending: true })
        .returns<Trade[]>();

      if (error) {
        fastify.log.error({ error, userId, date }, 'Failed to fetch day trades');
        throw new AppError(500, 'Failed to fetch day trades');
      }

      const tradeList: Trade[] = trades || [];
      const totalPnl = tradeList.reduce((sum, t) => sum + (t.pnl || 0), 0);

      return reply.status(200).send({
        date,
        trades: tradeList,
        summary: {
          trade_count: tradeList.length,
          total_pnl: totalPnl,
        },
      });
    }
  );
}

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Database } from '@journal-edge/db';
import { createUserClient, AppError } from '@journal-edge/fastify-framework';
import { env } from '../config/env.js';
import { tradeSchema, tradeQuerySchema, type TradeInput, type TradeQuery } from '../utils/validation.js';

type Trade = Database['public']['Tables']['trades']['Row'];
type TradeInsert = Database['public']['Tables']['trades']['Insert'];
type TradeUpdate = Database['public']['Tables']['trades']['Update'];

/**
 * Helper function to map TradeInput to TradeInsert
 * Converts API field names to database column names
 */
function mapTradeInputToInsert(input: TradeInput, userId: string): TradeInsert {
  return {
    user_id: userId,
    instrument: input.symbol,
    trade_date: input.entry_date.split('T')[0], // Extract date from datetime
    side: input.side.toUpperCase() as 'BUY' | 'SELL', // Map 'long'/'short' to 'BUY'/'SELL'
    quantity: input.quantity,
    entry_price: input.entry_price,
    entry_time: input.entry_date,
    exit_price: input.exit_price ?? 0, // Database requires this field
    exit_time: input.exit_date ?? new Date().toISOString(), // Database requires this field
    pnl: input.pnl ?? 0, // Database requires this field
    pnl_percent: null,
    duration_seconds: null,
    commission: input.commission ?? 0,
    notes: input.notes ?? null,
  };
}

/**
 * Helper function to map partial TradeInput to TradeUpdate
 * Converts API field names to database column names
 */
function mapTradeInputToUpdate(input: Partial<TradeInput>): TradeUpdate {
  const update: TradeUpdate = {};

  if (input.symbol !== undefined) update.instrument = input.symbol;
  if (input.entry_date !== undefined) {
    update.trade_date = input.entry_date.split('T')[0];
    update.entry_time = input.entry_date;
  }
  if (input.exit_date !== undefined) update.exit_time = input.exit_date;
  if (input.entry_price !== undefined) update.entry_price = input.entry_price;
  if (input.exit_price !== undefined) update.exit_price = input.exit_price;
  if (input.quantity !== undefined) update.quantity = input.quantity;
  if (input.side !== undefined) update.side = input.side.toUpperCase();
  if (input.pnl !== undefined) update.pnl = input.pnl;
  if (input.commission !== undefined) update.commission = input.commission;
  if (input.notes !== undefined) update.notes = input.notes;

  return update;
}

/**
 * Trade routes
 *
 * Security features:
 * - All routes require authentication
 * - Uses user-scoped Supabase client (respects RLS)
 * - Input validation on all endpoints
 * - Parameterized queries prevent SQL injection
 */
export async function tradeRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /trades
   * Get all trades for authenticated user with optional filtering
   */
  fastify.get(
    '/',
    {
      schema: {
        querystring: tradeQuerySchema,
      },
    },
    async (
      request: FastifyRequest<{ Querystring: TradeQuery }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      let query = supabase
        .from('trades')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('entry_time', { ascending: false });

      // Apply filters (map API field names to database column names)
      if (request.query.symbol) {
        query = query.eq('instrument', request.query.symbol);
      }
      if (request.query.start_date) {
        query = query.gte('entry_time', request.query.start_date);
      }
      if (request.query.end_date) {
        query = query.lte('entry_time', request.query.end_date);
      }
      if (request.query.side) {
        query = query.eq('side', request.query.side.toUpperCase());
      }

      // Pagination
      const limit = request.query.limit || 100;
      const offset = request.query.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query.returns<Trade[]>();

      if (error) {
        fastify.log.error({ error, userId }, 'Failed to fetch trades');
        throw new AppError(500, 'Failed to fetch trades');
      }

      return reply.status(200).send({
        trades: data,
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
      });
    }
  );

  /**
   * GET /trades/:id
   * Get a specific trade by ID
   */
  fastify.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', request.params.id)
        .eq('user_id', userId)
        .returns<Trade>()
        .single();

      if (error || !data) {
        throw new AppError(404, 'Trade not found');
      }

      return reply.status(200).send({ trade: data });
    }
  );

  /**
   * POST /trades
   * Create a new trade
   */
  fastify.post(
    '/',
    {
      schema: {
        body: tradeSchema,
      },
    },
    async (
      request: FastifyRequest<{ Body: TradeInput }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      const tradeData: TradeInsert = mapTradeInputToInsert(request.body, userId);

      const { data, error } = await supabase
        .from('trades')
        .insert(tradeData)
        .select()
        .returns<Trade>()
        .single();

      if (error) {
        fastify.log.error({ error, userId }, 'Failed to create trade');
        throw new AppError(500, 'Failed to create trade');
      }

      fastify.log.info({ userId, tradeId: data.id }, 'Trade created successfully');

      return reply.status(201).send({
        message: 'Trade created successfully',
        trade: data,
      });
    }
  );

  /**
   * PUT /trades/:id
   * Update an existing trade
   */
  fastify.put(
    '/:id',
    {
      schema: {
        body: tradeSchema.partial(),
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: Partial<TradeInput> }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      const updateData: TradeUpdate = mapTradeInputToUpdate(request.body);

      const { data, error } = await supabase
        .from('trades')
        .update(updateData)
        .eq('id', request.params.id)
        .eq('user_id', userId)
        .select()
        .returns<Trade>()
        .single();

      if (error) {
        fastify.log.error({ error, userId, tradeId: request.params.id }, 'Failed to update trade');
        throw new AppError(500, 'Failed to update trade');
      }

      if (!data) {
        throw new AppError(404, 'Trade not found');
      }

      fastify.log.info({ userId, tradeId: data.id }, 'Trade updated successfully');

      return reply.status(200).send({
        message: 'Trade updated successfully',
        trade: data,
      });
    }
  );

  /**
   * DELETE /trades/:id
   * Delete a trade
   */
  fastify.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const token = request.headers.authorization?.substring(7) || '';
      const supabase = createUserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, token);

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', request.params.id)
        .eq('user_id', userId);

      if (error) {
        fastify.log.error({ error, userId, tradeId: request.params.id }, 'Failed to delete trade');
        throw new AppError(500, 'Failed to delete trade');
      }

      fastify.log.info({ userId, tradeId: request.params.id }, 'Trade deleted successfully');

      return reply.status(200).send({
        message: 'Trade deleted successfully',
      });
    }
  );

  /**
   * POST /trades/import
   * Import trades from CSV file
   * Placeholder implementation - CSV parsing logic to be added
   */
  fastify.post(
    '/import',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      // TODO: Implement CSV parsing with csv-parse library
      // TODO: Validate CSV structure
      // TODO: Parse and normalize trade data
      // TODO: Batch insert trades
      // TODO: Return import summary

      fastify.log.info({ userId }, 'CSV import initiated');

      return reply.status(200).send({
        message: 'CSV import functionality to be implemented',
        import_id: 'placeholder',
      });
    }
  );
}

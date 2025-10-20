import { z } from 'zod';

/**
 * Validation schemas for data service endpoints
 *
 * Security features:
 * - Input sanitization through Zod
 * - Type validation for all fields
 * - Range validation for numeric values
 */

/**
 * Trade creation/update schema
 */
export const tradeSchema = z.object({
  symbol: z.string().min(1).max(20),
  entry_date: z.string().datetime(),
  exit_date: z.string().datetime().optional(),
  entry_price: z.number().positive(),
  exit_price: z.number().positive().optional(),
  quantity: z.number().positive(),
  side: z.enum(['long', 'short']),
  pnl: z.number().optional(),
  commission: z.number().min(0).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).optional(),
});

export type TradeInput = z.infer<typeof tradeSchema>;

/**
 * Trade query parameters schema
 */
export const tradeQuerySchema = z.object({
  symbol: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  side: z.enum(['long', 'short']).optional(),
  tags: z.string().optional(), // Comma-separated tag IDs
  limit: z.string().transform(Number).pipe(z.number().min(1).max(1000)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
});

export type TradeQuery = z.infer<typeof tradeQuerySchema>;

/**
 * Tag creation/update schema
 */
export const tagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().max(200).optional(),
});

export type TagInput = z.infer<typeof tagSchema>;

import { createApp, createAuthMiddleware, createSupabaseAdmin } from '@journal-edge/fastify-framework';
import { env } from './config/env.js';
import { tradeRoutes } from './routes/trade.routes.js';
import { tagRoutes } from './routes/tag.routes.js';
import { calendarRoutes } from './routes/calendar.routes.js';

/**
 * Creates and configures the Data Service application
 * Consolidates Trade, Tag, and Calendar functionality
 */
export async function buildApp() {
  // Create base Fastify app with common configuration
  const app = await createApp({
    env,
    serviceName: 'data-service',
    bodyLimit: 10485760, // 10MB for file uploads
  });

  // Create Supabase admin client for authentication middleware
  const supabaseAdmin = createSupabaseAdmin(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  // Create authentication middleware
  const authenticate = createAuthMiddleware(supabaseAdmin, app.log);

  // Add authentication to all routes
  app.addHook('onRequest', authenticate);

  // Register route groups with prefixes
  await app.register(tradeRoutes, { prefix: '/api/trades' });
  await app.register(tagRoutes, { prefix: '/api/tags' });
  await app.register(calendarRoutes, { prefix: '/api/calendar' });

  return app;
}

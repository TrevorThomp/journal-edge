import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import type { Database } from '@journal-edge/db';

/**
 * Supabase client with service role key
 * WARNING: This client bypasses Row Level Security (RLS)
 * Only use for trusted server-side operations
 * Never expose this client to the frontend
 *
 * Security considerations:
 * - Service key grants full database access
 * - Use only for admin operations and auth verification
 * - Never log or expose the service key
 * - Disable session persistence (stateless server)
 */
export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Creates a Supabase client with user's JWT token
 * This respects Row Level Security (RLS) policies
 * Use this for operations that should be scoped to the authenticated user
 */
export const createUserClient = (accessToken: string) => {
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

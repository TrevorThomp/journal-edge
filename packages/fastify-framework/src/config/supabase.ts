import { createClient } from '@supabase/supabase-js';
import type { Database } from '@journal-edge/db';

/**
 * Creates a Supabase admin client with service role key
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
export function createSupabaseAdmin(url: string, serviceKey: string) {
  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a Supabase client with user's JWT token
 * This respects Row Level Security (RLS) policies
 * Use this for operations that should be scoped to the authenticated user
 */
export function createUserClient(url: string, anonKey: string, accessToken: string) {
  return createClient<Database>(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

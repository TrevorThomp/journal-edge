import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Create a Supabase client for use in the browser or server
 */
export function createClient(supabaseUrl: string, supabaseKey: string) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Create a Supabase client for server-side use with service role key
 */
export function createServerClient(supabaseUrl: string, supabaseServiceKey: string) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

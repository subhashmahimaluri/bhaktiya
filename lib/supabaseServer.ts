/**
 * Supabase Server Client (Service Role)
 *
 * ⚠️ SECURITY WARNING: DO NOT import this file in client-side code!
 * This uses the service role key which bypasses RLS and has full database access.
 * Only use in API routes and server components.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables for server client");
}

/**
 * Server-side Supabase client with service role key
 * Use this for privileged operations that bypass RLS
 */
export const serverSupabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Creates a new instance of the server Supabase client
 * Use when you need a fresh client instance
 */
export function createServerSupabase() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

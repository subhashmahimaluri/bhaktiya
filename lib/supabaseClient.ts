// Supabase Client Utilities for Next.js 15 App Router
// Browser client for client components

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client for browser/client components
 * Uses the public anon key - safe to use in browser
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton browser client
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null;

/**
 * Get or create the browser Supabase client singleton
 */
export function getSupabase() {
  if (typeof window === "undefined") {
    throw new Error("getSupabase() should only be called in browser context");
  }
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }
  return browserClient;
}

/**
 * @deprecated Use lib/supabaseServer.ts for server-side operations
 */
export function createServiceSupabaseClient() {
  // Redirect to the proper server module
  const { serverSupabase } = require("./supabaseServer");
  return serverSupabase;
}

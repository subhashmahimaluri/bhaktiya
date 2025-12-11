// Simple Supabase Client for Browser
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a new client each time - avoids stale session issues
export function getSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

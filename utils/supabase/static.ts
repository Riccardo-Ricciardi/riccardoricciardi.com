import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/utils/supabase/client";
import type { Database } from "@/utils/supabase/database.types";

export type StaticSupabaseClient = SupabaseClient<Database, "public">;

let cached: StaticSupabaseClient | null = null;

export function createStaticClient(): StaticSupabaseClient {
  if (cached) return cached;
  const { url, anonKey } = getSupabaseEnv();
  cached = createSupabaseClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, init) },
  });
  return cached;
}

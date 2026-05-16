import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/utils/supabase/database.types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/utils/env";

export type TypedSupabaseClient = SupabaseClient<Database, "public">;

let cached: TypedSupabaseClient | null = null;

// Service-role admin client — bypasses RLS. Server-only.
export function createAdminClient(): TypedSupabaseClient {
  if (cached) return cached;

  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  cached = createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

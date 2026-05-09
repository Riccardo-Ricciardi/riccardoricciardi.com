import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/utils/supabase/client";

let cached: ReturnType<typeof createSupabaseClient> | null = null;

export function createStaticClient() {
  if (cached) return cached;
  const { url, anonKey } = getSupabaseEnv();
  cached = createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, init) },
  });
  return cached;
}

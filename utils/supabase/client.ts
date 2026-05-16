import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/utils/supabase/database.types";
import {
  getSupabaseAnonKey,
  getSupabaseAnonKeyOptional,
  getSupabaseUrl,
  getSupabaseUrlOptional,
} from "@/utils/env";

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrlOptional() && getSupabaseAnonKeyOptional());
}

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function getSupabaseEnv(): SupabaseEnv {
  return { url: getSupabaseUrl(), anonKey: getSupabaseAnonKey() };
}

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();

  // Create a supabase client on the browser with project's credentials
  return createBrowserClient<Database>(url, anonKey);
}

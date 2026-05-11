import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";

export type Language = {
  id: number;
  code: string;
  name: string;
  is_default: boolean;
};

const BUILD_FALLBACK: Language[] = [
  { id: 1, code: "en", name: "English", is_default: true },
];

export const getLanguages = cache(async (): Promise<Language[]> => {
  if (!isSupabaseConfigured()) return BUILD_FALLBACK;
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("languages")
    .select("id, code, name, is_default")
    .order("id", { ascending: true });
  if (error) {
    logger.error("languages: fetch failed", { message: error.message });
    return BUILD_FALLBACK;
  }
  if (!data || data.length === 0) return BUILD_FALLBACK;
  return data as Language[];
});

export async function getLanguageCodes(): Promise<string[]> {
  return (await getLanguages()).map((l) => l.code);
}

export async function getDefaultLanguageCode(): Promise<string> {
  const langs = await getLanguages();
  return langs.find((l) => l.is_default)?.code ?? langs[0]?.code ?? "en";
}

export async function isKnownLocale(code: string): Promise<boolean> {
  const codes = await getLanguageCodes();
  return codes.includes(code);
}

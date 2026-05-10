import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";
import type { SupportedLanguage } from "@/utils/config/app";

export type ContentBlock = { slug: string; value: string };

type Row = {
  slug: string;
  value: string;
  languages: { code: string } | { code: string }[] | null;
};

export const getContentBlocks = cache(
  async (locale: SupportedLanguage): Promise<Map<string, string>> => {
    const map = new Map<string, string>();
    if (!isSupabaseConfigured()) return map;

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("slug, value, languages(code)");

    if (error) {
      logger.error("content_blocks: fetch failed", { message: error.message });
      return map;
    }

    for (const row of (data ?? []) as Row[]) {
      const lang = Array.isArray(row.languages) ? row.languages[0] : row.languages;
      if (lang?.code === locale) map.set(row.slug, row.value);
    }
    return map;
  }
);

export function content(
  blocks: Map<string, string>,
  slug: string,
  fallback: string
): string {
  return blocks.get(slug) ?? fallback;
}

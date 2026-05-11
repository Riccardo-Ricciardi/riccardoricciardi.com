import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";
import type { SupportedLanguage } from "@/utils/config/app";

export type UsesItem = {
  id: number;
  category: string;
  name: string;
  url: string | null;
  icon_url: string | null;
  position: number;
  description: string | null;
};

type Row = {
  id: number;
  category: string;
  name: string;
  url: string | null;
  icon_url: string | null;
  position: number;
};

type I18nRow = {
  item_id: number;
  description: string | null;
  languages: { code: string } | { code: string }[] | null;
};

export const getUsesItems = cache(
  async (locale: SupportedLanguage): Promise<UsesItem[]> => {
    if (!isSupabaseConfigured()) return [];

    const supabase = createStaticClient();
    const [base, i18n] = await Promise.all([
      supabase
        .from("uses_items")
        .select("id, category, name, url, icon_url, position")
        .eq("visible", true)
        .order("category", { ascending: true })
        .order("position", { ascending: true }),
      supabase
        .from("uses_items_i18n")
        .select("item_id, description, languages(code)"),
    ]);

    if (base.error) {
      logger.error("uses_items: fetch failed", { message: base.error.message });
      return [];
    }
    const rows = (base.data ?? []) as Row[];
    const i18nMap = new Map<number, string>();
    for (const r of (i18n.data ?? []) as I18nRow[]) {
      const lang = Array.isArray(r.languages) ? r.languages[0] : r.languages;
      if (lang?.code === locale && r.description) {
        i18nMap.set(r.item_id, r.description);
      }
    }

    return rows.map((r) => ({
      ...r,
      description: i18nMap.get(r.id) ?? null,
    }));
  }
);

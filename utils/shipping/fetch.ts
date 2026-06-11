import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";
import type { SupportedLanguage } from "@/utils/config/app";

export type ShippingLogEntry = {
  id: number;
  happenedOn: string;
  body: string;
};

type ShippingLogRow = {
  id: number;
  happened_on: string;
  position: number;
  shipping_log_i18n: {
    body: string;
    languages: { code: string } | { code: string }[] | null;
  }[];
};

export const getShippingLog = cache(
  async (locale: SupportedLanguage): Promise<ShippingLogEntry[]> => {
    if (!isSupabaseConfigured()) return [];

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("shipping_log")
      .select("id, happened_on, position, shipping_log_i18n(body, languages(code))")
      .eq("visible", true)
      .order("happened_on", { ascending: false })
      .order("position", { ascending: true });

    if (error) {
      logger.error("shipping_log: fetch failed", { message: error.message });
      return [];
    }

    const entries: ShippingLogEntry[] = [];
    for (const row of (data ?? []) as ShippingLogRow[]) {
      const match = row.shipping_log_i18n.find((t) => {
        const lang = Array.isArray(t.languages) ? t.languages[0] : t.languages;
        return lang?.code === locale;
      });
      const fallback = row.shipping_log_i18n[0];
      const body = match?.body ?? fallback?.body;
      if (!body) continue;
      entries.push({ id: row.id, happenedOn: row.happened_on, body });
    }
    return entries;
  }
);

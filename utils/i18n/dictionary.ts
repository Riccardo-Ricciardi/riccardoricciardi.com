import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import {
  APP_CONFIG,
  type SupportedLanguage,
  type TranslationTable,
} from "@/utils/config/app";
import type { Dictionary, NavbarItem } from "@/utils/i18n/types";
import type { Database } from "@/utils/supabase/database.types";
import { logger } from "@/utils/logger";

const FALLBACK: Dictionary = {
  navbar: [],
  theme: ["Light", "Dark", "System"],
  not_found: ["Page not found", "Back to home"],
};

type TranslationRow =
  Database["public"]["Tables"][TranslationTable]["Row"];

export const getDictionary = cache(
  async (locale: SupportedLanguage): Promise<Dictionary> => {
    if (!isSupabaseConfigured()) return FALLBACK;

    const supabase = createStaticClient();

    const { data: language, error: langError } = await supabase
      .from("languages")
      .select("id")
      .eq("code", locale)
      .maybeSingle();

    if (langError || !language) {
      logger.warn("dictionary: language not found", { locale });
      return FALLBACK;
    }

    const entries = await Promise.all(
      APP_CONFIG.translationTables.map(async (table: TranslationTable) => {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("language_id", language.id)
          .order("position", { ascending: true });

        if (error) {
          logger.error("dictionary: translation fetch failed", {
            locale,
            table,
            message: error.message,
          });
          return [table, []] as const;
        }

        const rows: TranslationRow[] = data ?? [];

        if (table === "navbar") {
          const items: NavbarItem[] = rows.map((r, i) => {
            const raw = (r.slug ?? "").trim().toLowerCase();
            const isHome = raw === "" || raw === "home" || raw === "/" || i === 0;
            return {
              slug: isHome ? "" : raw,
              label: r.value,
              position: r.position,
            };
          });
          return [table, items] as const;
        }

        return [table, rows.map((r) => r.value)] as const;
      })
    );

    return {
      ...FALLBACK,
      ...Object.fromEntries(entries),
    } as Dictionary;
  }
);

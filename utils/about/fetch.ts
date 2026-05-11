import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";
import type { SupportedLanguage } from "@/utils/config/app";

export type AboutSection = {
  id: number;
  heading: string | null;
  body: string;
  position: number;
};

type Row = {
  id: number;
  heading: string | null;
  body: string;
  position: number;
  languages: { code: string } | { code: string }[] | null;
};

export const getAboutSections = cache(
  async (locale: SupportedLanguage): Promise<AboutSection[]> => {
    if (!isSupabaseConfigured()) return [];

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("about_sections")
      .select("id, heading, body, position, languages(code)")
      .order("position", { ascending: true });

    if (error) {
      logger.error("about_sections: fetch failed", { message: error.message });
      return [];
    }

    const out: AboutSection[] = [];
    for (const row of (data ?? []) as Row[]) {
      const lang = Array.isArray(row.languages) ? row.languages[0] : row.languages;
      if (lang?.code === locale) {
        out.push({
          id: row.id,
          heading: row.heading,
          body: row.body,
          position: row.position,
        });
      }
    }
    return out;
  }
);

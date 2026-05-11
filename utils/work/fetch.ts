import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";
import type { SupportedLanguage } from "@/utils/config/app";

export type WorkExperience = {
  id: number;
  company: string;
  role: string;
  url: string | null;
  location: string | null;
  started_at: string;
  ended_at: string | null;
  is_current: boolean;
  position: number;
  summary: string | null;
  bullets: string[];
};

type Row = {
  id: number;
  company: string;
  role: string;
  url: string | null;
  location: string | null;
  started_at: string;
  ended_at: string | null;
  is_current: boolean;
  position: number;
};

type I18nRow = {
  experience_id: number;
  summary: string | null;
  bullets: string[] | null;
  languages: { code: string } | { code: string }[] | null;
};

export const getWorkExperience = cache(
  async (locale: SupportedLanguage): Promise<WorkExperience[]> => {
    if (!isSupabaseConfigured()) return [];

    const supabase = createStaticClient();
    const [base, i18n] = await Promise.all([
      supabase
        .from("work_experience")
        .select(
          "id, company, role, url, location, started_at, ended_at, is_current, position"
        )
        .order("started_at", { ascending: false }),
      supabase
        .from("work_experience_i18n")
        .select("experience_id, summary, bullets, languages(code)"),
    ]);

    if (base.error) {
      logger.error("work_experience: fetch failed", { message: base.error.message });
      return [];
    }
    const rows = (base.data ?? []) as Row[];
    const i18nMap = new Map<number, { summary: string | null; bullets: string[] }>();
    for (const r of (i18n.data ?? []) as I18nRow[]) {
      const lang = Array.isArray(r.languages) ? r.languages[0] : r.languages;
      if (lang?.code === locale) {
        i18nMap.set(r.experience_id, {
          summary: r.summary,
          bullets: r.bullets ?? [],
        });
      }
    }

    return rows.map((r) => ({
      ...r,
      summary: i18nMap.get(r.id)?.summary ?? null,
      bullets: i18nMap.get(r.id)?.bullets ?? [],
    }));
  }
);

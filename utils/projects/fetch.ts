import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";
import type { SupportedLanguage } from "@/utils/config/app";

export type Project = {
  id: string;
  repo: string;
  name: string | null;
  description: string | null;
  url: string | null;
  homepage: string | null;
  stars: number | null;
  forks: number | null;
  language: string | null;
  topics: string[] | null;
  og_image: string | null;
  screenshot_url: string | null;
  position: number;
};

type ProjectI18n = {
  project_id: string;
  description: string | null;
  languages: { code: string } | { code: string }[] | null;
};

export const getProjects = cache(
  async (locale: SupportedLanguage): Promise<Project[]> => {
    if (!isSupabaseConfigured()) return [];

    const supabase = createStaticClient();

    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, repo, name, description, url, homepage, stars, forks, language, topics, og_image, screenshot_url, position"
      )
      .eq("visible", true)
      .order("position", { ascending: true });

    if (error) {
      logger.error("projects: fetch failed", { message: error.message });
      return [];
    }

    const projects = (data ?? []) as Project[];
    if (projects.length === 0) return projects;

    const ids = projects.map((p) => p.id);

    const { data: i18nRows, error: i18nError } = await supabase
      .from("projects_i18n")
      .select("project_id, description, languages(code)")
      .in("project_id", ids);

    if (i18nError) {
      logger.error("projects_i18n: fetch failed", { message: i18nError.message });
      return projects;
    }

    const overrides = new Map<string, string>();
    for (const row of (i18nRows ?? []) as ProjectI18n[]) {
      const lang = Array.isArray(row.languages) ? row.languages[0] : row.languages;
      if (lang?.code === locale && row.description) {
        overrides.set(row.project_id, row.description);
      }
    }

    return projects.map((p) => ({
      ...p,
      description: overrides.get(p.id) ?? p.description,
    }));
  }
);

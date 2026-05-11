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
  problem: string | null;
  solution: string | null;
  outcome: string | null;
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
  problem: string | null;
  solution: string | null;
  outcome: string | null;
  languages: { code: string } | { code: string }[] | null;
};

export const getProjects = cache(
  async (locale: SupportedLanguage): Promise<Project[]> => {
    if (!isSupabaseConfigured()) return [];

    const supabase = createStaticClient();

    const baseColumns =
      "id, repo, name, description, url, homepage, stars, forks, language, topics, og_image, screenshot_url, position";
    const narrativeColumns = ", problem, solution, outcome";

    let { data, error } = await supabase
      .from("projects")
      .select(baseColumns + narrativeColumns)
      .eq("visible", true)
      .order("position", { ascending: true });

    if (error?.message?.includes("does not exist")) {
      const fallback = await supabase
        .from("projects")
        .select(baseColumns)
        .eq("visible", true)
        .order("position", { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      logger.error("projects: fetch failed", { message: error.message });
      return [];
    }

    const projects = ((data ?? []) as Partial<Project>[]).map(
      (p) =>
        ({
          problem: null,
          solution: null,
          outcome: null,
          ...p,
        }) as Project
    );
    if (projects.length === 0) return projects;

    const ids = projects.map((p) => p.id);

    const i18nBase = "project_id, description, languages(code)";
    const i18nNarrative = ", problem, solution, outcome";

    let i18nQuery = await supabase
      .from("projects_i18n")
      .select(i18nBase + i18nNarrative)
      .in("project_id", ids);

    if (i18nQuery.error?.message?.includes("does not exist")) {
      i18nQuery = await supabase
        .from("projects_i18n")
        .select(i18nBase)
        .in("project_id", ids);
    }

    const { data: i18nRows, error: i18nError } = i18nQuery;

    if (i18nError) {
      logger.error("projects_i18n: fetch failed", { message: i18nError.message });
      return projects;
    }

    type Override = Partial<Pick<Project, "description" | "problem" | "solution" | "outcome">>;
    const overrides = new Map<string, Override>();
    for (const row of (i18nRows ?? []) as ProjectI18n[]) {
      const lang = Array.isArray(row.languages) ? row.languages[0] : row.languages;
      if (lang?.code !== locale) continue;
      overrides.set(row.project_id, {
        description: row.description ?? undefined,
        problem: row.problem ?? undefined,
        solution: row.solution ?? undefined,
        outcome: row.outcome ?? undefined,
      });
    }

    return projects.map((p) => {
      const o = overrides.get(p.id);
      if (!o) return p;
      return {
        ...p,
        description: o.description ?? p.description,
        problem: o.problem ?? p.problem,
        solution: o.solution ?? p.solution,
        outcome: o.outcome ?? p.outcome,
      };
    });
  }
);

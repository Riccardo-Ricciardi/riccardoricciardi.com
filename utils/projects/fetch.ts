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

    const projectsWithNarrative = await supabase
      .from("projects")
      .select(
        "id, repo, name, description, url, homepage, stars, forks, language, topics, og_image, screenshot_url, position, problem, solution, outcome"
      )
      .eq("visible", true)
      .order("position", { ascending: true });

    let data: Partial<Project>[] | null = projectsWithNarrative.data;
    let error = projectsWithNarrative.error;

    if (error?.message?.includes("does not exist")) {
      const fallback = await supabase
        .from("projects")
        .select(
          "id, repo, name, description, url, homepage, stars, forks, language, topics, og_image, screenshot_url, position"
        )
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

    const i18nFull = await supabase
      .from("projects_i18n")
      .select("project_id, description, languages(code), problem, solution, outcome")
      .in("project_id", ids);

    let i18nRows: ProjectI18n[] | null = i18nFull.data as ProjectI18n[] | null;
    let i18nError = i18nFull.error;

    if (i18nError?.message?.includes("does not exist")) {
      const fallback = await supabase
        .from("projects_i18n")
        .select("project_id, description, languages(code)")
        .in("project_id", ids);
      i18nRows = fallback.data as ProjectI18n[] | null;
      i18nError = fallback.error;
    }

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

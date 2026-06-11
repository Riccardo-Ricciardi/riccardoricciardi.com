import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";
import type { SupportedLanguage } from "@/utils/config/app";

export type ProjectKind = "repo" | "case_study";
export type ProjectStatus = "live" | "shipped" | "archived";

export type Project = {
  id: string;
  repo: string | null;
  slug: string | null;
  kind: ProjectKind;
  status: ProjectStatus | null;
  surface: string | null;
  telemetry: string | null;
  featured: boolean;
  name: string | null;
  description: string | null;
  problem: string | null;
  solution: string | null;
  outcome: string | null;
  metrics: string[];
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

type ProjectI18nRow = {
  project_id: string;
  description: string | null;
  problem: string | null;
  solution: string | null;
  outcome: string | null;
  one_liner: string | null;
  metrics: string[] | null;
  languages: { code: string } | { code: string }[] | null;
};

const PROJECT_COLUMNS =
  "id, repo, slug, kind, status, surface, telemetry, featured, name, description, url, homepage, stars, forks, language, topics, og_image, screenshot_url, position, problem, solution, outcome";

export const getProjects = cache(
  async (locale: SupportedLanguage): Promise<Project[]> => {
    if (!isSupabaseConfigured()) return [];

    const supabase = createStaticClient();

    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("visible", true)
      .order("position", { ascending: true });

    if (error) {
      logger.error("projects: fetch failed", { message: error.message });
      return [];
    }

    const projects: Project[] = (data ?? []).map((p) => ({
      ...p,
      kind: (p.kind === "case_study" ? "case_study" : "repo") as ProjectKind,
      status: (p.status ?? null) as ProjectStatus | null,
      featured: Boolean(p.featured),
      metrics: [],
    }));
    if (projects.length === 0) return projects;

    const ids = projects.map((p) => p.id);

    const { data: i18nData, error: i18nError } = await supabase
      .from("projects_i18n")
      .select(
        "project_id, description, problem, solution, outcome, one_liner, metrics, languages(code)"
      )
      .in("project_id", ids);

    if (i18nError) {
      logger.error("projects_i18n: fetch failed", {
        message: i18nError.message,
      });
      return projects;
    }

    type Override = {
      description?: string;
      problem?: string;
      solution?: string;
      outcome?: string;
      one_liner?: string;
      metrics?: string[];
    };
    const overrides = new Map<string, Override>();
    for (const row of (i18nData ?? []) as ProjectI18nRow[]) {
      const lang = Array.isArray(row.languages) ? row.languages[0] : row.languages;
      if (lang?.code !== locale) continue;
      overrides.set(row.project_id, {
        description: row.one_liner ?? row.description ?? undefined,
        problem: row.problem ?? undefined,
        solution: row.solution ?? undefined,
        outcome: row.outcome ?? undefined,
        metrics: row.metrics ?? undefined,
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
        metrics: o.metrics ?? p.metrics,
      };
    });
  }
);

export const getCaseStudies = cache(
  async (locale: SupportedLanguage): Promise<Project[]> => {
    const projects = await getProjects(locale);
    return projects.filter((p) => p.kind === "case_study");
  }
);

export const getRepoProjects = cache(
  async (locale: SupportedLanguage): Promise<Project[]> => {
    const projects = await getProjects(locale);
    return projects.filter((p) => p.kind === "repo");
  }
);

import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";

export type Skill = {
  id: number;
  name: string;
  position: number;
  percentage: number;
  dark: boolean;
  icon_url: string | null;
  icon_dark_url: string | null;
  category: string | null;
};

export type SkillCategory = {
  slug: string;
  label_it: string;
  label_en: string;
  icon: string | null;
  position: number;
};

export type SkillGroup = {
  category: SkillCategory;
  skills: Skill[];
};

const UNCATEGORIZED_SLUG = "_uncategorized";

export const getSkills = cache(async (): Promise<Skill[]> => {
  if (!isSupabaseConfigured()) return [];

  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("skills")
    .select("id, name, position, percentage, dark, icon_url, icon_dark_url, category")
    .order("position", { ascending: true });

  if (error) {
    logger.error("skills: fetch failed", { message: error.message });
    return [];
  }

  return (data ?? []) as Skill[];
});

export const getSkillCategories = cache(async (): Promise<SkillCategory[]> => {
  if (!isSupabaseConfigured()) return [];

  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("skill_categories")
    .select("slug, label_it, label_en, icon, position")
    .order("position", { ascending: true });

  if (error) {
    logger.error("skill_categories: fetch failed", { message: error.message });
    return [];
  }

  return (data ?? []) as SkillCategory[];
});

export const getSkillGroups = cache(async (): Promise<SkillGroup[]> => {
  const [skills, categories] = await Promise.all([getSkills(), getSkillCategories()]);

  const bySlug = new Map<string, Skill[]>();
  for (const s of skills) {
    const key = s.category ?? UNCATEGORIZED_SLUG;
    const bucket = bySlug.get(key) ?? [];
    bucket.push(s);
    bySlug.set(key, bucket);
  }
  for (const bucket of bySlug.values()) {
    bucket.sort((a, b) => b.percentage - a.percentage);
  }

  const groups: SkillGroup[] = categories
    .map((category) => ({
      category,
      skills: bySlug.get(category.slug) ?? [],
    }))
    .filter((g) => g.skills.length > 0);

  const orphans = bySlug.get(UNCATEGORIZED_SLUG) ?? [];
  if (orphans.length > 0) {
    groups.push({
      category: {
        slug: UNCATEGORIZED_SLUG,
        label_it: "Altro",
        label_en: "Other",
        icon: "Sparkles",
        position: 999,
      },
      skills: orphans,
    });
  }

  return groups;
});

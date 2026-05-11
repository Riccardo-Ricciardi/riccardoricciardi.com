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

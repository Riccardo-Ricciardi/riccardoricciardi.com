import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";

export type Skill = {
  id: number;
  name: string;
  position: number;
  percentage: number;
  dark: boolean;
};

export const getSkills = cache(async (): Promise<Skill[]> => {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("id, name, position, percentage, dark")
    .order("position", { ascending: true });

  if (error) {
    logger.error("skills: fetch failed", { message: error.message });
    return [];
  }

  return (data ?? []) as Skill[];
});

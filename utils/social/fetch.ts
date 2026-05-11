import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";

export type SocialLink = {
  id: number;
  kind: string;
  label: string | null;
  url: string;
  position: number;
};

export const getSocialLinks = cache(async (): Promise<SocialLink[]> => {
  if (!isSupabaseConfigured()) return [];

  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("id, kind, label, url, position")
    .eq("visible", true)
    .order("position", { ascending: true });

  if (error) {
    logger.error("social_links: fetch failed", { message: error.message });
    return [];
  }
  return (data ?? []) as SocialLink[];
});

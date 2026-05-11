import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";

export type SiteIdentity = {
  name: string;
  email: string | null;
  profile_photo_url: string | null;
  primary_cta_href: string;
  secondary_cta_href: string;
};

const FALLBACK: SiteIdentity = {
  name: "Riccardo Ricciardi",
  email: null,
  profile_photo_url: null,
  primary_cta_href: "#projects",
  secondary_cta_href: "#skills",
};

export const getSiteIdentity = cache(async (): Promise<SiteIdentity> => {
  if (!isSupabaseConfigured()) return FALLBACK;

  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("site_identity")
    .select("name, email, profile_photo_url, primary_cta_href, secondary_cta_href")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    logger.error("site_identity: fetch failed", { message: error.message });
    return FALLBACK;
  }

  const row = data as Partial<SiteIdentity> | null;
  if (!row) return FALLBACK;

  return {
    name: row.name ?? FALLBACK.name,
    email: row.email ?? null,
    profile_photo_url: row.profile_photo_url ?? null,
    primary_cta_href: row.primary_cta_href ?? FALLBACK.primary_cta_href,
    secondary_cta_href: row.secondary_cta_href ?? FALLBACK.secondary_cta_href,
  };
});

import { cache } from "react";
import { createStaticClient } from "@/utils/supabase/static";
import { isSupabaseConfigured } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";

export type ThemeSetting = {
  key: string;
  value_light: string;
  value_dark: string | null;
  type: "color" | "length" | "text" | "number";
  group_name: string;
  description: string | null;
  position: number;
};

const KEY_TO_VAR: Record<string, string> = {
  accent_blue: "--accent-blue",
  accent_blue_hover: "--accent-blue-hover",
  accent_blue_soft: "--accent-blue-soft",
  border_dashed: "--border-dashed",
  container_max_width: "--container-max-width",
  section_padding_y: "--section-padding-y",
  radius: "--radius",
  hero_glow_opacity: "--hero-glow-opacity",
};

export const getThemeSettings = cache(async (): Promise<ThemeSetting[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("theme_settings")
    .select("key, value_light, value_dark, type, group_name, description, position")
    .order("group_name", { ascending: true })
    .order("position", { ascending: true });

  if (error) {
    logger.error("theme_settings: fetch failed", { message: error.message });
    return [];
  }
  return (data ?? []) as ThemeSetting[];
});

export function buildThemeCss(settings: ThemeSetting[]): string {
  const light: string[] = [];
  const dark: string[] = [];

  for (const s of settings) {
    const cssVar = KEY_TO_VAR[s.key];
    if (!cssVar) continue;
    light.push(`${cssVar}: ${s.value_light};`);
    if (s.value_dark) dark.push(`${cssVar}: ${s.value_dark};`);
  }

  if (light.length === 0 && dark.length === 0) return "";

  return `:root{${light.join("")}}.dark{${dark.join("")}}`;
}

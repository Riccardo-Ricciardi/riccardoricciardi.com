export type Skill = {
  id: number;
  name: string;
  percentage: number;
  position: number;
  dark: boolean;
  category: string | null;
  icon_url: string | null;
  icon_dark_url: string | null;
};

export type SkillCategory = {
  slug: string;
  label_it: string;
  label_en: string;
  icon: string | null;
  position: number;
};

export type Project = {
  id: string;
  repo: string | null;
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
  visible: boolean;
  synced_at: string | null;
  kind: string;
  status: string | null;
  surface: string | null;
  telemetry: string | null;
  featured: boolean;
  slug: string | null;
};

export type SocialLink = {
  id: number;
  kind: string;
  label: string | null;
  url: string;
  position: number;
  visible: boolean;
};

export type AboutSection = {
  id: number;
  language_id: number;
  heading: string | null;
  body: string;
  position: number;
};

export type ThemeSettingRow = {
  key: string;
  value_light: string;
  value_dark: string | null;
  type: "color" | "length" | "text" | "number";
  group_name: string;
  description: string | null;
  position: number;
};

export type MediaFolder = {
  name: string;
  count: number;
};

export type MediaFile = {
  name: string;
  path: string;
  url: string;
  size: number;
  updated_at: string | null;
  content_type: string | null;
};

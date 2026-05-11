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

export type Project = {
  id: string;
  repo: string;
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
};

export type Language = { id: number; code: string; name: string };

export type SiteIdentity = {
  id: number;
  name: string;
  email: string | null;
  profile_photo_url: string | null;
  primary_cta_href: string | null;
  secondary_cta_href: string | null;
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

export type ContentBlock = {
  id: number;
  slug: string;
  value: string;
  language_id: number;
};

export type NavbarRow = {
  id: number;
  slug: string | null;
  value: string;
  language_id: number;
  position: number;
};

export type NotFoundRow = {
  id: number;
  slug: string;
  value: string;
  language_id: number;
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

export type MediaItem = {
  name: string;
  path: string;
  url: string;
  size: number | null;
  updated_at: string | null;
  content_type: string | null;
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

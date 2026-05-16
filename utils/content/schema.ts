export interface ContentField {
  slug: string;
  label: string;
  description?: string;
  multiline?: boolean;
}

export interface ContentSection {
  key: string;
  title: string;
  description?: string;
  fields: ContentField[];
}

export const CONTENT_SCHEMA: ContentSection[] = [
  {
    key: "hero",
    title: "Hero",
    description: "Top-of-page banner copy",
    fields: [
      { slug: "hero_eyebrow", label: "Eyebrow", description: "Small pill text above the title" },
      { slug: "hero_title", label: "Title", multiline: true },
      { slug: "hero_subtitle", label: "Subtitle", multiline: true },
      { slug: "hero_primary_cta", label: "Primary CTA" },
      { slug: "hero_secondary_cta", label: "Secondary CTA" },
    ],
  },
  {
    key: "services",
    title: "Services section (home)",
    description: "Three-card services block under the home hero",
    fields: [
      { slug: "services_eyebrow", label: "Eyebrow" },
      { slug: "services_heading", label: "Heading" },
      { slug: "services_subtitle", label: "Subtitle", multiline: true },
      { slug: "service_1_title", label: "Card 1 — title" },
      { slug: "service_1_body", label: "Card 1 — body", multiline: true },
      { slug: "service_2_title", label: "Card 2 — title" },
      { slug: "service_2_body", label: "Card 2 — body", multiline: true },
      { slug: "service_3_title", label: "Card 3 — title" },
      { slug: "service_3_body", label: "Card 3 — body", multiline: true },
    ],
  },
  {
    key: "skills",
    title: "Skills section",
    fields: [
      { slug: "skills_eyebrow", label: "Eyebrow" },
      { slug: "skills_heading", label: "Heading" },
    ],
  },
  {
    key: "projects",
    title: "Projects section",
    fields: [
      { slug: "projects_eyebrow", label: "Eyebrow" },
      { slug: "projects_heading", label: "Heading" },
      { slug: "projects_subtitle", label: "Subtitle", multiline: true },
    ],
  },
  {
    key: "about",
    title: "About page",
    fields: [
      { slug: "about_eyebrow", label: "Eyebrow" },
      { slug: "about_heading", label: "Heading" },
      { slug: "about_subtitle", label: "Subtitle", multiline: true },
    ],
  },
  {
    key: "work",
    title: "Work page",
    fields: [
      { slug: "work_eyebrow", label: "Eyebrow" },
      { slug: "work_heading", label: "Heading" },
      { slug: "work_subtitle", label: "Subtitle", multiline: true },
    ],
  },
  {
    key: "uses",
    title: "Uses page",
    fields: [
      { slug: "uses_eyebrow", label: "Eyebrow" },
      { slug: "uses_heading", label: "Heading" },
      { slug: "uses_subtitle", label: "Subtitle", multiline: true },
    ],
  },
  {
    key: "common",
    title: "Common labels",
    description: "Shared UI strings reused across pages",
    fields: [
      { slug: "common_all", label: "All / filter reset" },
      { slug: "common_empty_uses", label: "Empty state — /uses" },
      { slug: "common_empty_work", label: "Empty state — /work" },
      { slug: "common_empty_about", label: "Empty state — /about" },
    ],
  },
  {
    key: "contact",
    title: "Contact page",
    description: "Headline, subtitle and trust signals on /contact",
    fields: [
      { slug: "contact_eyebrow", label: "Eyebrow" },
      { slug: "contact_heading", label: "Headline" },
      { slug: "contact_subtitle", label: "Subtitle", multiline: true },
      { slug: "contact_trust", label: "Trust badge" },
      { slug: "contact_secondary_heading", label: "Secondary links heading" },
      { slug: "contact_email_label", label: "Email card label" },
    ],
  },
  {
    key: "aria",
    title: "Accessibility labels",
    description: "Screen-reader labels for navigation, menus and theme/language switchers",
    fields: [
      { slug: "aria_nav", label: "Main navigation" },
      { slug: "aria_menu", label: "Open menu" },
      { slug: "aria_language", label: "Language switcher" },
      { slug: "aria_theme", label: "Theme switcher" },
      { slug: "aria_home", label: "Home link" },
      { slug: "aria_skip", label: "Skip to main content link" },
    ],
  },
];

export const KNOWN_SLUGS = new Set(
  CONTENT_SCHEMA.flatMap((s) => s.fields.map((f) => f.slug))
);

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
    key: "skills",
    title: "Skills section",
    fields: [{ slug: "skills_heading", label: "Heading" }],
  },
  {
    key: "projects",
    title: "Projects section",
    fields: [
      { slug: "projects_heading", label: "Heading" },
      { slug: "projects_subtitle", label: "Subtitle", multiline: true },
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
];

export const KNOWN_SLUGS = new Set(
  CONTENT_SCHEMA.flatMap((s) => s.fields.map((f) => f.slug))
);

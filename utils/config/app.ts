export const APP_CONFIG = {
  languages: ["en", "it"] as const,
  defaultLanguage: "en" as const,
  mobileBreakpointPx: 900,
  translationTables: ["navbar", "theme", "not-found"] as const,
  siteName: "Riccardo Ricciardi",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://riccardoricciardi.com",
  author: {
    name: "Riccardo Ricciardi",
    email: "riccardo.ricciardi2009@gmail.com",
    sameAs: [] as string[],
  },
  revalidate: {
    skills: 3600,
    translations: 3600,
  },
} as const;

export type SupportedLanguage = (typeof APP_CONFIG.languages)[number];
export type TranslationTable = (typeof APP_CONFIG.translationTables)[number];

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (APP_CONFIG.languages as readonly string[]).includes(value);
}

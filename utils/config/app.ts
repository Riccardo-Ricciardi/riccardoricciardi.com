/**
 * Build-time language snapshot. Edge contexts (middleware/proxy, OG image
 * generators, static helpers) cannot await a DB fetch — they read from this
 * env-driven list. Server pages that can hit Supabase should prefer the
 * DB-backed helpers in @/utils/i18n/languages, which include any language
 * added at runtime via /admin/languages.
 */
const ENV_LANGUAGES = (process.env.NEXT_PUBLIC_LANGUAGES ?? "en,it")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ENV_DEFAULT_LANGUAGE =
  process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE?.trim() ||
  ENV_LANGUAGES[0] ||
  "en";

export const APP_CONFIG = {
  languages: ENV_LANGUAGES as readonly string[],
  defaultLanguage: ENV_DEFAULT_LANGUAGE as string,
  mobileBreakpointPx: 900,
  translationTables: ["navbar", "theme", "not_found"] as const,
  siteName: "Riccardo Ricciardi",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://riccardoricciardi.com",
  author: {
    name: "Riccardo Ricciardi",
    email: "info@riccardoricciardi.com",
    sameAs: [] as string[],
  },
  revalidate: {
    skills: 3600,
    translations: 3600,
  },
} as const;

/**
 * Locale code. Languages are managed in Supabase; this alias is permissive so
 * adding a new language from /admin/languages does not require code changes.
 */
export type SupportedLanguage = string;
export type TranslationTable = (typeof APP_CONFIG.translationTables)[number];

/**
 * Sync locale guard backed by the build-time env list. Use for edge/static
 * contexts. Server pages with DB access should prefer `isKnownLocale` from
 * @/utils/i18n/languages for full runtime dynamism.
 */
export function isSupportedLanguage(value: string): boolean {
  return APP_CONFIG.languages.includes(value);
}

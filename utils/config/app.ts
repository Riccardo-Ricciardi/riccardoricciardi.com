export const APP_CONFIG = {
  languages: ["en", "it"] as const,
  defaultLanguage: "en" as const,
  mobileBreakpointPx: 900,
  translationTables: ["navbar", "theme", "not-found"] as const,
  navbar: {
    logoWidthPx: 36,
    controlsWidthPx: 96,
    safetyGapPx: 24,
  },
};

export type SupportedLanguage = (typeof APP_CONFIG.languages)[number];
export type TranslationTable = (typeof APP_CONFIG.translationTables)[number];

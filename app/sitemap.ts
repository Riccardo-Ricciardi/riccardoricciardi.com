import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/utils/config/app";
import {
  getDefaultLanguageCode,
  getLanguageCodes,
} from "@/utils/i18n/languages";

const ROUTES = ["", "about", "work", "uses", "contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = APP_CONFIG.siteUrl;
  const now = new Date();

  const [codes, defaultCode] = await Promise.all([
    getLanguageCodes(),
    getDefaultLanguageCode(),
  ]);

  const entries: MetadataRoute.Sitemap = [];
  for (const route of ROUTES) {
    for (const locale of codes) {
      const path = route ? `/${locale}/${route}` : `/${locale}`;
      entries.push({
        url: `${base}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority:
          route === ""
            ? locale === defaultCode
              ? 1
              : 0.8
            : 0.6,
        alternates: {
          languages: Object.fromEntries(
            codes.map((l) => [
              l,
              `${base}${route ? `/${l}/${route}` : `/${l}`}`,
            ])
          ),
        },
      });
    }
  }
  return entries;
}

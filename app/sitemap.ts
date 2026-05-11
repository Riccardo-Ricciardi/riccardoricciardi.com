import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/utils/config/app";

const ROUTES = ["", "about", "contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = APP_CONFIG.siteUrl;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];
  for (const route of ROUTES) {
    for (const locale of APP_CONFIG.languages) {
      const path = route ? `/${locale}/${route}` : `/${locale}`;
      entries.push({
        url: `${base}${path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority:
          route === ""
            ? locale === APP_CONFIG.defaultLanguage
              ? 1
              : 0.8
            : 0.6,
        alternates: {
          languages: Object.fromEntries(
            APP_CONFIG.languages.map((l) => [
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

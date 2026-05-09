import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/utils/config/app";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = APP_CONFIG.siteUrl;
  const now = new Date();

  return APP_CONFIG.languages.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: locale === APP_CONFIG.defaultLanguage ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        APP_CONFIG.languages.map((l) => [l, `${base}/${l}`])
      ),
    },
  }));
}

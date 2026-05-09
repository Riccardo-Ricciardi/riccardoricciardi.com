import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/utils/config/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${APP_CONFIG.siteUrl}/sitemap.xml`,
    host: APP_CONFIG.siteUrl,
  };
}

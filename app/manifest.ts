import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/utils/config/app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_CONFIG.siteName,
    short_name: "Riccardo",
    description: "The official website of Riccardo Ricciardi",
    start_url: `/${APP_CONFIG.defaultLanguage}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}

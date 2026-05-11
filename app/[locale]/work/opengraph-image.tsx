import { APP_CONFIG, isSupportedLanguage } from "@/utils/config/app";
import { renderOg, ogContentType, ogSize } from "@/utils/og/render";

export const alt = "Work — Riccardo Ricciardi";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isSupportedLanguage(params.locale)
    ? params.locale
    : APP_CONFIG.defaultLanguage;
  const isIt = locale === "it";
  return renderOg({
    eyebrow: "/work",
    title: isIt ? "Esperienze" : "Work",
    subtitle: isIt
      ? "Una timeline di ruoli e momenti chiave."
      : "A timeline of roles and turning points.",
    brand: APP_CONFIG.siteUrl.replace(/^https?:\/\//, ""),
  });
}

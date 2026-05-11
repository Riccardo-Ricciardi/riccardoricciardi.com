import { APP_CONFIG, isSupportedLanguage } from "@/utils/config/app";
import { renderOg, ogContentType, ogSize } from "@/utils/og/render";

export const alt = "About — Riccardo Ricciardi";
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
    eyebrow: "/about",
    title: isIt ? "Chi sono" : "About",
    subtitle: isIt
      ? "Il mio percorso, gli strumenti, l'approccio."
      : "My path, tools, and approach.",
    brand: APP_CONFIG.siteUrl.replace(/^https?:\/\//, ""),
  });
}

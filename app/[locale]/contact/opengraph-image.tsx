import { APP_CONFIG, isSupportedLanguage } from "@/utils/config/app";
import { renderOg, ogContentType, ogSize } from "@/utils/og/render";

export const alt = "Contact — Riccardo Ricciardi";
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
    eyebrow: "/contact",
    title: isIt ? "Parliamone" : "Let's talk",
    subtitle: isIt
      ? "Email, social, o una chiamata di 30 minuti."
      : "Email, socials, or a 30-minute call.",
    brand: APP_CONFIG.siteUrl.replace(/^https?:\/\//, ""),
  });
}

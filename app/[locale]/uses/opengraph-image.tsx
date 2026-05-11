import { APP_CONFIG, isSupportedLanguage } from "@/utils/config/app";
import { renderOg, ogContentType, ogSize } from "@/utils/og/render";

export const alt = "Uses — Riccardo Ricciardi";
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
    eyebrow: "/uses",
    title: isIt ? "Strumenti" : "Uses",
    subtitle: isIt
      ? "Hardware, editor, librerie, servizi."
      : "Hardware, editors, libraries, services.",
    brand: APP_CONFIG.siteUrl.replace(/^https?:\/\//, ""),
  });
}

import { APP_CONFIG, isSupportedLanguage } from "@/utils/config/app";
import { content, getContentBlocks } from "@/utils/content/fetch";
import { renderOg, ogContentType, ogSize } from "@/utils/og/render";

export const alt = APP_CONFIG.author.name;
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
  const blocks = await getContentBlocks(locale);
  return renderOg({
    eyebrow: "/about",
    title: content(blocks, "og_about_title", ""),
    subtitle: content(blocks, "og_about_subtitle", ""),
    brand: APP_CONFIG.siteUrl.replace(/^https?:\/\//, ""),
  });
}

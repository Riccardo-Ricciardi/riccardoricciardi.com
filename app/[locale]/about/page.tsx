import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { About } from "@/components/site/about/section";
import {
  APP_CONFIG,
  isSupportedLanguage,
  type SupportedLanguage,
} from "@/utils/config/app";
import { content, getContentBlocks } from "@/utils/content/fetch";

export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return APP_CONFIG.languages.map((locale) => ({ locale }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isIt = locale === "it";
  const title = isIt ? "Chi sono" : "About";
  return {
    title,
    description: isIt
      ? "Sviluppatore full-stack. Il mio percorso, gli strumenti, l'approccio."
      : "Full-stack developer. My path, tools, and approach.",
    alternates: {
      canonical: `/${locale}/about`,
      languages: Object.fromEntries(
        APP_CONFIG.languages.map((l) => [l, `${APP_CONFIG.siteUrl}/${l}/about`])
      ),
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLanguage(locale)) notFound();

  const isIt = locale === "it";
  const blocks = await getContentBlocks(locale as SupportedLanguage);

  const heading = content(blocks, "about_heading", isIt ? "Chi sono" : "About");
  const eyebrow = content(blocks, "about_eyebrow", "/about");
  const subtitle = content(
    blocks,
    "about_subtitle",
    isIt
      ? "Sviluppatore full-stack con un debole per l'interfaccia, la performance e i dettagli."
      : "Full-stack developer with a soft spot for interface, performance, and detail."
  );

  return (
    <About
      heading={heading}
      eyebrow={eyebrow}
      subtitle={subtitle}
      locale={locale as SupportedLanguage}
    />
  );
}

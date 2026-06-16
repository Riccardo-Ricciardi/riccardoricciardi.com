import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { About } from "@/components/site/about/section";
import { APP_CONFIG } from "@/utils/config/app";
import {
  getLanguageCodes,
  isKnownLocale,
} from "@/utils/i18n/languages";
import { content, getContentBlocks } from "@/utils/content/fetch";

export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const codes = await getLanguageCodes();
  return codes.map((code) => ({ locale: code }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const [blocks, codes] = await Promise.all([
    getContentBlocks(locale),
    getLanguageCodes(),
  ]);
  const title = content(blocks, "about_heading", "");
  const description = content(blocks, "about_subtitle", "");
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/about`,
      languages: Object.fromEntries(
        codes.map((l) => [l, `${APP_CONFIG.siteUrl}/${l}/about`])
      ),
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const blocks = await getContentBlocks(locale);

  const heading = content(blocks, "about_heading", "");
  const subtitle = content(blocks, "about_subtitle", "");
  const emptyTitle = content(blocks, "about_empty_title", "");
  const emptyBody = content(blocks, "common_empty_about", "");
  const emptyCta = content(blocks, "about_empty_cta", "");
  const primaryCtaLabel = content(blocks, "about_cta_primary_label", "");
  const primaryCtaHref = content(
    blocks,
    "about_cta_primary_href",
    `/${locale}/contact`
  );
  const secondaryCtaLabel = content(blocks, "about_cta_secondary_label", "");
  const secondaryCtaHref = content(
    blocks,
    "about_cta_secondary_href",
    `/${locale}/work`
  );

  const facts = {
    location: content(blocks, "about_facts_location", ""),
    languages: content(blocks, "about_facts_languages", ""),
    availability: content(blocks, "hero_availability", ""),
  };

  const pullQuote = content(blocks, "about_pull_quote", "");

  const makerHeading = content(blocks, "maker_heading", "");
  const makerCells = [
    {
      label: content(blocks, "maker_esp32_label", "ESP32 / Arduino"),
      line: content(blocks, "maker_esp32_line", ""),
    },
    {
      label: content(blocks, "maker_bambu_label", "Bambu Lab A1"),
      line: content(blocks, "maker_bambu_line", ""),
    },
  ];
  const makerUsesCell = {
    label: content(blocks, "maker_uses_label", ""),
    line: content(blocks, "maker_uses_line", ""),
  };

  return (
    <About
      heading={heading}
      subtitle={subtitle}
      locale={locale}
      facts={facts}
      pullQuote={pullQuote}
      makerHeading={makerHeading}
      makerCells={makerCells}
      makerUsesCell={makerUsesCell}
      emptyTitle={emptyTitle}
      emptyBody={emptyBody}
      emptyCta={{ label: emptyCta, href: `/${locale}/contact` }}
      primaryCta={{ label: primaryCtaLabel, href: primaryCtaHref }}
      secondaryCta={{ label: secondaryCtaLabel, href: secondaryCtaHref }}
    />
  );
}

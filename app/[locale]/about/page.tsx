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
  const title = content(blocks, "about_heading", "About");
  const description = content(
    blocks,
    "about_subtitle",
    "Full-stack developer."
  );
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
  const isIt = locale === "it";

  const heading = content(blocks, "about_heading", "About");
  const subtitle = content(
    blocks,
    "about_subtitle",
    "Full-stack developer with a soft spot for interface, performance, and detail."
  );
  const emptyTitle = content(
    blocks,
    "about_empty_title",
    isIt ? "Pagina in scrittura." : "Still writing this page."
  );
  const emptyBody = content(
    blocks,
    "common_empty_about",
    isIt
      ? "Sto preparando una bio onesta. Nel frattempo, scrivimi se vuoi saperne di più."
      : "I'm putting together an honest bio. In the meantime, get in touch if you want to know more."
  );
  const emptyCta = content(
    blocks,
    "about_empty_cta",
    isIt ? "Scrivimi" : "Get in touch"
  );
  const primaryCtaLabel = content(
    blocks,
    "about_cta_primary_label",
    isIt ? "Vediamoci" : "Let's talk"
  );
  const primaryCtaHref = content(
    blocks,
    "about_cta_primary_href",
    `/${locale}/contact`
  );
  const secondaryCtaLabel = content(
    blocks,
    "about_cta_secondary_label",
    isIt ? "Vedi i lavori" : "See the work"
  );
  const secondaryCtaHref = content(
    blocks,
    "about_cta_secondary_href",
    `/${locale}/work`
  );

  const facts = {
    location: content(
      blocks,
      "about_facts_location",
      isIt ? "Napoli, Italia" : "Naples, Italy"
    ),
    languages: content(
      blocks,
      "about_facts_languages",
      isIt ? "Italiano e inglese" : "Italian and English"
    ),
    availability: content(
      blocks,
      "hero_availability",
      isIt ? "Napoli · disponibile" : "Naples · available"
    ),
  };

  const pullQuote = content(
    blocks,
    "about_pull_quote",
    isIt ? "Quello che prometto, lo rilascio." : "I ship what I promise."
  );

  const makerHeading = content(
    blocks,
    "maker_heading",
    isIt ? "Sul banco" : "On the bench"
  );
  const makerCells = [
    {
      label: content(blocks, "maker_esp32_label", "ESP32 / Arduino"),
      line: content(
        blocks,
        "maker_esp32_line",
        isIt
          ? "Sensori, relay e firmware per la casa."
          : "Sensors, relays and firmware around the house."
      ),
    },
    {
      label: content(blocks, "maker_bambu_label", "Bambu Lab A1"),
      line: content(
        blocks,
        "maker_bambu_line",
        isIt
          ? "Stampa 3D per scocche, staffe e ricambi."
          : "3D printing for enclosures, brackets and spare parts."
      ),
    },
  ];
  const makerUsesCell = {
    label: content(
      blocks,
      "maker_uses_label",
      isIt ? "Tutto il resto" : "Everything else"
    ),
    line: content(
      blocks,
      "maker_uses_line",
      isIt ? "La lista completa di cosa uso." : "The full list of what I use."
    ),
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

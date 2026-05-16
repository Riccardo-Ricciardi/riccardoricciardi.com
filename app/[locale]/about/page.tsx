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
  const blocks = await getContentBlocks(locale);
  const codes = await getLanguageCodes();
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
  const eyebrow = content(blocks, "about_eyebrow", "/about");
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

  return (
    <About
      heading={heading}
      eyebrow={eyebrow}
      subtitle={subtitle}
      locale={locale}
      emptyTitle={emptyTitle}
      emptyBody={emptyBody}
      emptyCta={{ label: emptyCta, href: `/${locale}/contact` }}
      primaryCta={{ label: primaryCtaLabel, href: primaryCtaHref }}
      secondaryCta={{ label: secondaryCtaLabel, href: secondaryCtaHref }}
    />
  );
}

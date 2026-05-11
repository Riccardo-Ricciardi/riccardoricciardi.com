import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Contact } from "@/components/site/contact/section";
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
  const title = isIt ? "Contatti" : "Contact";
  return {
    title,
    description: isIt
      ? "Parliamone — email e canali social."
      : "Let's talk — email and social channels.",
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(
        APP_CONFIG.languages.map((l) => [l, `${APP_CONFIG.siteUrl}/${l}/contact`])
      ),
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLanguage(locale)) notFound();

  const isIt = locale === "it";
  const blocks = await getContentBlocks(locale as SupportedLanguage);

  const heading = content(blocks, "contact_heading", isIt ? "Parliamone" : "Let's talk");
  const eyebrow = content(blocks, "contact_eyebrow", "/contact");
  const subtitle = content(
    blocks,
    "contact_subtitle",
    isIt
      ? "Email è il modo più veloce. Sono anche sui social qui sotto."
      : "Email is fastest. I'm also on the social channels below."
  );
  const emailLabel = content(
    blocks,
    "contact_email_label",
    isIt ? "Scrivimi" : "Email me"
  );

  return (
    <Contact
      heading={heading}
      eyebrow={eyebrow}
      subtitle={subtitle}
      emailLabel={emailLabel}
      locale={locale}
    />
  );
}

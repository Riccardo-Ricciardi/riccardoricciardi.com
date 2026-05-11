import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/site/atoms/section-heading";
import { UsesList } from "@/components/site/uses/uses-list";
import { getUsesItems } from "@/utils/uses/fetch";
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
  return {
    title: isIt ? "Strumenti" : "Uses",
    description: isIt
      ? "L'hardware, gli editor e i tool che uso ogni giorno."
      : "The hardware, editors, and tools I use every day.",
    alternates: {
      canonical: `/${locale}/uses`,
      languages: Object.fromEntries(
        APP_CONFIG.languages.map((l) => [l, `${APP_CONFIG.siteUrl}/${l}/uses`])
      ),
    },
  };
}

export default async function UsesPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLanguage(locale)) notFound();

  const isIt = locale === "it";
  const [items, blocks] = await Promise.all([
    getUsesItems(locale as SupportedLanguage),
    getContentBlocks(locale as SupportedLanguage),
  ]);

  const heading = content(blocks, "uses_heading", isIt ? "Strumenti" : "Uses");
  const eyebrow = content(blocks, "uses_eyebrow", "/uses");
  const subtitle = content(
    blocks,
    "uses_subtitle",
    isIt
      ? "Hardware, editor, librerie, servizi. Cosa uso davvero."
      : "Hardware, editors, libraries, services. What I actually use."
  );

  return (
    <section
      aria-labelledby="uses-heading"
      className="container-page section-divider-b py-16 md:py-24 lg:py-28"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="uses-heading"
        className="mb-12 md:mb-16"
      />

      {items.length === 0 ? (
        <p className="text-base text-muted-foreground">
          {isIt ? "Sto ancora preparando questa pagina." : "Still putting this together."}
        </p>
      ) : (
        <UsesList items={items} />
      )}
    </section>
  );
}

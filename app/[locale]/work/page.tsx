import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/site/atoms/section-heading";
import { WorkTimeline } from "@/components/site/work/timeline";
import { getWorkExperience } from "@/utils/work/fetch";
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
    title: isIt ? "Esperienze" : "Work",
    description: isIt
      ? "Il mio percorso professionale e le esperienze più rilevanti."
      : "My career timeline and most relevant experience.",
    alternates: {
      canonical: `/${locale}/work`,
      languages: Object.fromEntries(
        APP_CONFIG.languages.map((l) => [l, `${APP_CONFIG.siteUrl}/${l}/work`])
      ),
    },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLanguage(locale)) notFound();

  const isIt = locale === "it";
  const [items, blocks] = await Promise.all([
    getWorkExperience(locale as SupportedLanguage),
    getContentBlocks(locale as SupportedLanguage),
  ]);

  const heading = content(blocks, "work_heading", isIt ? "Esperienze" : "Work");
  const eyebrow = content(blocks, "work_eyebrow", "/work");
  const subtitle = content(
    blocks,
    "work_subtitle",
    isIt
      ? "Una timeline di ruoli, aziende e momenti chiave."
      : "A timeline of roles, companies, and turning points."
  );

  return (
    <section
      aria-labelledby="work-heading"
      className="container-page section-divider-b section-y"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="work-heading"
        className="mb-12 md:mb-16"
      />

      {items.length === 0 ? (
        <p className="text-base text-muted-foreground">
          {isIt ? "Sto ancora compilando la timeline." : "Still filling in the timeline."}
        </p>
      ) : (
        <div className="mx-auto max-w-3xl">
          <WorkTimeline
            items={items}
            locale={locale}
            currentLabel={isIt ? "in corso" : "current"}
            presentLabel={isIt ? "presente" : "present"}
          />
        </div>
      )}
    </section>
  );
}

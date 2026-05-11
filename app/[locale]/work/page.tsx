import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock4 } from "lucide-react";
import { SectionHeading } from "@/components/site/atoms/section-heading";
import { WorkTimeline } from "@/components/site/work/timeline";
import { getWorkExperience } from "@/utils/work/fetch";
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
  const title = content(blocks, "work_heading", "Work");
  const description = content(
    blocks,
    "work_subtitle",
    "My career timeline."
  );
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/work`,
      languages: Object.fromEntries(
        codes.map((l) => [l, `${APP_CONFIG.siteUrl}/${l}/work`])
      ),
    },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const [items, blocks] = await Promise.all([
    getWorkExperience(locale),
    getContentBlocks(locale),
  ]);

  const heading = content(blocks, "work_heading", "Work");
  const eyebrow = content(blocks, "work_eyebrow", "/work");
  const subtitle = content(
    blocks,
    "work_subtitle",
    "A timeline of roles, companies, and turning points."
  );
  const currentLabel = content(blocks, "work_current_label", "current");
  const presentLabel = content(blocks, "work_present_label", "present");
  const emptyTitle = content(
    blocks,
    "work_empty_title",
    locale === "it" ? "Presto qui." : "Soon here."
  );
  const emptyBody = content(
    blocks,
    "work_empty_body",
    locale === "it"
      ? "Sto preparando una timeline curata delle esperienze più rilevanti. Nel frattempo, se vuoi parlarne con me, scrivimi."
      : "I'm putting together a curated timeline of the most relevant roles. In the meantime, drop me a line if you want to talk."
  );
  const emptyCta = content(
    blocks,
    "work_empty_cta",
    locale === "it" ? "Parliamone" : "Get in touch"
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
        <div className="card-base card-pad-lg mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-pill border border-dashed-soft bg-background/60 text-accent-blue">
            <Clock4 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-h3">{emptyTitle}</h3>
            <p className="text-body-sm mt-2 max-w-prose text-muted-foreground">
              {emptyBody}
            </p>
          </div>
          <Link
            href={`/${locale}/contact`}
            className="btn-base btn-primary"
          >
            {emptyCta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <WorkTimeline
            items={items}
            locale={locale}
            currentLabel={currentLabel}
            presentLabel={presentLabel}
          />
        </div>
      )}
    </section>
  );
}

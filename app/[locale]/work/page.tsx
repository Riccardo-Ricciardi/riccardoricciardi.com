import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock4 } from "lucide-react";
import { Heading } from "@/components/site/atoms/heading";
import { EmptyState } from "@/components/site/atoms/empty-state";
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

async function WorkList({ locale }: { locale: string }) {
  const [items, blocks] = await Promise.all([
    getWorkExperience(locale),
    getContentBlocks(locale),
  ]);

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

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Clock4}
        title={emptyTitle}
        description={emptyBody}
        action={{ href: `/${locale}/contact`, label: emptyCta }}
      />
    );
  }

  return (
    <WorkTimeline
      items={items}
      locale={locale}
      currentLabel={currentLabel}
      presentLabel={presentLabel}
    />
  );
}

function WorkListSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-6 border-b border-dashed-soft py-8 first:border-t"
        >
          <div className="flex flex-col items-center gap-2 pt-1">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted" />
            <div className="w-px flex-1 animate-pulse bg-muted" />
          </div>
          <div className="flex flex-1 flex-col gap-3 pb-2">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 flex flex-col gap-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function WorkPage({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const blocks = await getContentBlocks(locale);
  const heading = content(blocks, "work_heading", "Work");
  const eyebrow = content(blocks, "work_eyebrow", "/work");
  const subtitle = content(
    blocks,
    "work_subtitle",
    "A timeline of roles, companies, and turning points."
  );

  return (
    <section
      aria-labelledby="work-heading"
      className="container-page section-divider-b section-y"
    >
      <div className="content-narrow">
        <Heading
          level="h1"
          eyebrow={eyebrow}
          title={heading}
          subtitle={subtitle}
          id="work-heading"
          className="mb-12 md:mb-16"
        />

        <Suspense fallback={<WorkListSkeleton />}>
          <WorkList locale={locale} />
        </Suspense>
      </div>
    </section>
  );
}

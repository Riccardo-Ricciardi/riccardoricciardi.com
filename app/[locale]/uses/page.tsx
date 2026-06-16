import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import { Heading } from "@/components/site/atoms/heading";
import { EmptyState } from "@/components/site/atoms/empty-state";
import { UsesList } from "@/components/site/uses/uses-list";
import { StackStrip } from "@/components/site/uses/stack-strip";
import { getUsesItems } from "@/utils/uses/fetch";
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
  const title = content(blocks, "uses_heading", "");
  const description = content(blocks, "uses_subtitle", "");
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/uses`,
      languages: Object.fromEntries(
        codes.map((l) => [l, `${APP_CONFIG.siteUrl}/${l}/uses`])
      ),
    },
  };
}

async function UsesFeed({
  locale,
  updatedLabel,
  emptyLabel,
  emptyTitle,
  emptyCta,
}: {
  locale: string;
  updatedLabel: string;
  emptyLabel: string;
  emptyTitle: string;
  emptyCta: string;
}) {
  const items = await getUsesItems(locale);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={emptyTitle}
        description={emptyLabel}
        action={{ href: `/${locale}/contact`, label: emptyCta }}
      />
    );
  }

  const latest = items.reduce<string | null>(
    (max, item) =>
      item.updated_at && (!max || item.updated_at > max)
        ? item.updated_at
        : max,
    null
  );

  return (
    <>
      {latest && (
        <p className="text-telemetry mb-8 text-right">
          {updatedLabel} {latest.slice(0, 7)}
        </p>
      )}
      <UsesList items={items} />
    </>
  );
}

function UsesFeedSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="mb-8 h-3 w-32 animate-pulse self-end rounded bg-muted" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={
            "grid gap-x-12 gap-y-6 py-10 first:pt-0 md:grid-cols-[11rem_1fr]" +
            (i > 0 ? " border-t border-border" : "")
          }
        >
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex flex-col gap-2">
                <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full max-w-prose animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StackStripSkeleton() {
  return (
    <div className="mt-16 border-t border-border pt-10 md:mt-20">
      <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="size-6 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default async function UsesPage({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const blocks = await getContentBlocks(locale);
  const heading = content(blocks, "uses_heading", "");
  const intro = content(blocks, "uses_intro_sv", "");
  const updatedLabel = content(blocks, "uses_updated_label", "");
  const stackHeading = content(blocks, "uses_stack_heading", "");
  const stackSrLabel = content(blocks, "uses_stack_sr_label", "");
  const emptyLabel = content(blocks, "common_empty_uses", "");
  const emptyTitle = content(blocks, "uses_empty_title", "");
  const emptyCta = content(blocks, "uses_empty_cta", "");

  return (
    <section
      aria-labelledby="uses-heading"
      className="container-page section-divider-b section-y"
    >
      <Heading
        level="h1"
        title={heading}
        subtitle={intro}
        id="uses-heading"
        className="mb-12 md:mb-16"
      />

      <Suspense fallback={<UsesFeedSkeleton />}>
        <UsesFeed
          locale={locale}
          updatedLabel={updatedLabel}
          emptyLabel={emptyLabel}
          emptyTitle={emptyTitle}
          emptyCta={emptyCta}
        />
      </Suspense>

      <Suspense fallback={<StackStripSkeleton />}>
        <StackStrip heading={stackHeading} srLabel={stackSrLabel} />
      </Suspense>
    </section>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import { Heading } from "@/components/site/atoms/heading";
import { EmptyState } from "@/components/site/atoms/empty-state";
import { UsesList } from "@/components/site/uses/uses-list";
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
  const blocks = await getContentBlocks(locale);
  const codes = await getLanguageCodes();
  const title = content(blocks, "uses_heading", "Uses");
  const description = content(
    blocks,
    "uses_subtitle",
    "Hardware, editors, libraries, services."
  );
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
  emptyLabel,
  emptyTitle,
  emptyCta,
}: {
  locale: string;
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

  return <UsesList items={items} />;
}

function UsesFeedSkeleton() {
  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="h-20 animate-pulse rounded-surface bg-muted"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function UsesPage({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const blocks = await getContentBlocks(locale);
  const heading = content(blocks, "uses_heading", "Uses");
  const eyebrow = content(blocks, "uses_eyebrow", "/uses");
  const subtitle = content(
    blocks,
    "uses_subtitle",
    "Hardware, editors, libraries, services. What I actually use."
  );
  const emptyLabel = content(
    blocks,
    "common_empty_uses",
    "Still putting this together."
  );
  const emptyTitle = content(
    blocks,
    "uses_empty_title",
    locale === "it" ? "In allestimento." : "Still curating."
  );
  const emptyCta = content(
    blocks,
    "uses_empty_cta",
    locale === "it" ? "Chiedi cosa uso" : "Ask what I use"
  );

  return (
    <section
      aria-labelledby="uses-heading"
      className="container-page section-divider-b section-y"
    >
      <Heading
        level="h1"
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="uses-heading"
        className="mb-12 md:mb-16"
      />

      <Suspense fallback={<UsesFeedSkeleton />}>
        <UsesFeed
          locale={locale}
          emptyLabel={emptyLabel}
          emptyTitle={emptyTitle}
          emptyCta={emptyCta}
        />
      </Suspense>
    </section>
  );
}

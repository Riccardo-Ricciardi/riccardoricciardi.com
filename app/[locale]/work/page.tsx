import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const emptyLabel = content(
    blocks,
    "common_empty_work",
    "Still filling in the timeline."
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
        <p className="text-body-lg text-muted-foreground">{emptyLabel}</p>
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

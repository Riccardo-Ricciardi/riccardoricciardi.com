import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/site/atoms/section-heading";
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

export default async function UsesPage({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const [items, blocks] = await Promise.all([
    getUsesItems(locale),
    getContentBlocks(locale),
  ]);

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

  return (
    <section
      aria-labelledby="uses-heading"
      className="container-page section-divider-b section-y"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="uses-heading"
        className="mb-12 md:mb-16"
      />

      {items.length === 0 ? (
        <p className="text-body-lg text-muted-foreground">{emptyLabel}</p>
      ) : (
        <UsesList items={items} />
      )}
    </section>
  );
}

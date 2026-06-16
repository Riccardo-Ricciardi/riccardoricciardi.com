import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Heading } from "@/components/site/atoms/heading";
import {
  CaseStudies,
  CaseStudiesSkeleton,
} from "@/components/site/work/case-studies";
import {
  ShippingLog,
  ShippingLogSkeleton,
} from "@/components/site/work/shipping-log";
import {
  GithubStrip,
  GithubStripSkeleton,
} from "@/components/site/work/github-strip";
import { ClosingCta } from "@/components/site/closing-cta";
import { getSiteIdentity } from "@/utils/identity/fetch";
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
  const title = content(blocks, "work_heading", "");
  const description = content(blocks, "work_subtitle", "");
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

  const [blocks, identity] = await Promise.all([
    getContentBlocks(locale),
    getSiteIdentity(),
  ]);

  const heading = content(blocks, "work_heading", "");
  const intro = content(blocks, "work_intro_sv", "");
  const problemLabel = content(blocks, "work_problem_label", "");
  const solutionLabel = content(blocks, "work_solution_label", "");
  const outcomeLabel = content(blocks, "work_outcome_label", "");
  const shippingHeading = content(blocks, "shipping_log_heading", "");
  const githubHeading = content(blocks, "github_strip_heading", "");
  const closingHeading = content(blocks, "closing_heading", "");
  const closingSub = content(blocks, "closing_sub", "");
  const contactLabel = content(blocks, "contact_label", "");

  return (
    <>
      <section
        aria-labelledby="work-heading"
        className="container-page section-divider-b section-y"
      >
        <div className="content-narrow">
          <Heading
            level="h1"
            title={heading}
            subtitle={intro}
            id="work-heading"
          />
        </div>
      </section>

      <Suspense fallback={<CaseStudiesSkeleton />}>
        <CaseStudies
          locale={locale}
          labels={{
            problem: problemLabel,
            solution: solutionLabel,
            outcome: outcomeLabel,
          }}
        />
      </Suspense>

      <Suspense fallback={<ShippingLogSkeleton />}>
        <ShippingLog locale={locale} heading={shippingHeading} />
      </Suspense>

      <Suspense fallback={<GithubStripSkeleton />}>
        <GithubStrip locale={locale} heading={githubHeading} />
      </Suspense>

      <ClosingCta
        heading={closingHeading}
        sub={closingSub}
        buttonLabel={contactLabel}
        href={`/${locale}/contact`}
        email={identity.email}
      />
    </>
  );
}

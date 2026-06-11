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

  const isIt = locale === "it";
  const [blocks, identity] = await Promise.all([
    getContentBlocks(locale),
    getSiteIdentity(),
  ]);

  const heading = content(
    blocks,
    "work_heading",
    isIt ? "Lavori" : "Work"
  );
  const intro = content(
    blocks,
    "work_intro_sv",
    isIt
      ? "Non una lista di progetti. Sistemi in produzione, con problemi veri e numeri veri. Questo è quello che gira adesso."
      : "Not a project list. Systems in production, with real problems and real numbers. This is what's running now."
  );
  const problemLabel = content(
    blocks,
    "work_problem_label",
    isIt ? "Problema" : "Problem"
  );
  const solutionLabel = content(
    blocks,
    "work_solution_label",
    isIt ? "Soluzione" : "Solution"
  );
  const outcomeLabel = content(
    blocks,
    "work_outcome_label",
    isIt ? "Risultato" : "Outcome"
  );
  const shippingHeading = content(
    blocks,
    "shipping_log_heading",
    isIt ? "Registro dei rilasci" : "Shipping log"
  );
  const githubHeading = content(
    blocks,
    "github_strip_heading",
    isIt ? "Altri esperimenti su GitHub" : "More experiments on GitHub"
  );
  const closingHeading = content(
    blocks,
    "closing_heading",
    isIt ? "Hai un processo che fa male?" : "Got a process that hurts?"
  );
  const closingSub = content(
    blocks,
    "closing_sub",
    isIt
      ? "Raccontami cosa ti mangia le ore. Se il software può sistemarlo ti dico come. Rispondo io, entro 24 ore."
      : "Tell me what eats your hours. If software can fix it, I'll tell you how. I reply personally, within 24 hours."
  );
  const contactLabel = content(
    blocks,
    "contact_label",
    isIt ? "Scrivimi" : "Write me"
  );

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

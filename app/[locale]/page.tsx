import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/hero";
import { Proof } from "@/components/site/proof/section";
import { Surfaces, type SurfaceEntry } from "@/components/site/surfaces/section";
import { Services, type ServiceItem } from "@/components/site/services/section";
import { CodeShowcase } from "@/components/site/code/showcase";
import { StackRow } from "@/components/site/stack/section";
import { ClosingCta } from "@/components/site/closing-cta";
import { GlobalLoader } from "@/components/global-loader";
import { getLanguageCodes, isKnownLocale } from "@/utils/i18n/languages";
import { content, getContentBlocks } from "@/utils/content/fetch";
import { getSiteIdentity } from "@/utils/identity/fetch";

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

const SURFACE_IDS = ["windows-desktop", "web", "embedded-esp32"] as const;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const [blocks, identity] = await Promise.all([
    getContentBlocks(locale),
    getSiteIdentity(),
  ]);

  const heroTitle = content(blocks, "hero_title", "I build software that ships");
  const heroProof = content(
    blocks,
    "hero_proof_clause",
    "Full-stack developer. I ship what I promise."
  );
  const heroWordmark = content(
    blocks,
    "hero_wordmark_line",
    "RICCARDO RICCIARDI · SOFTWARE & AUTOMATION"
  );
  const heroPrimary = content(blocks, "hero_cta_primary", "See what's running");
  const contactLabel = content(blocks, "contact_label", "");

  const proofEyebrow = content(blocks, "proof_eyebrow", "");
  const proofHeading = content(blocks, "proof_heading", "");
  const proofLinkLabel = content(blocks, "proof_link_label", "");

  const codeEyebrow = content(blocks, "code_eyebrow", "How I build");
  const codeHeading = content(
    blocks,
    "code_heading",
    "Automation that ships itself"
  );
  const codeIntro = content(
    blocks,
    "code_intro",
    "Pipelines, integrations and internal tools that run unattended — typed end to end, deployed with zero downtime."
  );

  const stackEyebrow = content(blocks, "stack_eyebrow", "Stack");
  const stackHeading = content(blocks, "stack_heading", "One toolchain, end to end");
  const stackIntro = content(
    blocks,
    "stack_intro",
    "From embedded devices to production web — a coherent set of tools I trust in production."
  );
  const stackGroupLabels = {
    languages: content(blocks, "stack_group_languages", "Languages"),
    frontend: content(blocks, "stack_group_frontend", "Frontend"),
    backend: content(blocks, "stack_group_backend", "Backend & Infra"),
    hardware: content(blocks, "stack_group_hardware", "Hardware & QA"),
  };

  const surfacesEyebrow = content(blocks, "surfaces_eyebrow", "");
  const surfacesHeading = content(blocks, "surfaces_heading", "");
  const surfacesIntro = content(blocks, "surfaces_intro", "");

  const surfaceHref: Record<string, string | undefined> = {
    "windows-desktop": `/${locale}/work#f24-tool`,
    web: `/${locale}/work`,
    "embedded-esp32": `/${locale}/about`,
  };
  const surfaceEntries: SurfaceEntry[] = SURFACE_IDS.map((id) => ({
    id,
    label: content(blocks, `surface_${id}_label`, id),
    line: content(blocks, `surface_${id}_line`, ""),
    href: surfaceHref[id],
    tinted: id === "windows-desktop",
  })).filter((entry) => entry.line);

  const servicesEyebrow = content(blocks, "services_eyebrow", "");
  const servicesHeading = content(blocks, "services_heading", "");
  const serviceItems: ServiceItem[] = [
    {
      id: "desktop-automation",
      title: content(blocks, "service_desktop-automation_title", ""),
      body: content(blocks, "service_desktop-automation_body", ""),
      primary: true,
    },
    {
      id: "full-stack-product",
      title: content(blocks, "service_full-stack-product_title", ""),
      body: content(blocks, "service_full-stack-product_body", ""),
    },
    {
      id: "integrations-rescue",
      title: content(blocks, "service_integrations-rescue_title", ""),
      body: content(blocks, "service_integrations-rescue_body", ""),
    },
  ].filter((s) => s.title && s.body);

  const closingHeading = content(blocks, "closing_heading", "");
  const closingSub = content(blocks, "closing_sub", "");

  return (
    <>
      <Hero
        wordmarkLine={heroWordmark}
        title={heroTitle}
        proofClause={heroProof}
        primaryCta={{ label: heroPrimary, href: "#proof" }}
        secondaryCta={{ label: contactLabel, href: `/${locale}/contact` }}
      />
      <CodeShowcase
        eyebrow={codeEyebrow}
        heading={codeHeading}
        intro={codeIntro}
      />
      <Suspense fallback={<GlobalLoader />}>
        <Proof
          locale={locale}
          eyebrow={proofEyebrow}
          heading={proofHeading}
          linkLabel={proofLinkLabel}
        />
      </Suspense>
      <Surfaces
        eyebrow={surfacesEyebrow}
        heading={surfacesHeading}
        intro={surfacesIntro}
        entries={surfaceEntries}
      />
      <StackRow
        eyebrow={stackEyebrow}
        heading={stackHeading}
        intro={stackIntro}
        groupLabels={stackGroupLabels}
      />
      <Services
        eyebrow={servicesEyebrow}
        heading={servicesHeading}
        items={serviceItems}
        contactHref={`/${locale}/contact`}
      />
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

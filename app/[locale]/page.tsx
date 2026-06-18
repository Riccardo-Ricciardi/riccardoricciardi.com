import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/hero";
import { Proof } from "@/components/site/proof/section";
import { type SurfaceEntry } from "@/components/site/surfaces/section";
import { SurfacesBento } from "@/components/site/surfaces/bento";
import { Services, type ServiceItem } from "@/components/site/services/section";
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
  const heroAvailability = content(blocks, "hero_availability", "Available for new work");
  const contactLabel = content(blocks, "contact_label", "");

  const proofEyebrow = content(blocks, "proof_eyebrow", "");
  const proofHeading = content(blocks, "proof_heading", "");
  const proofLinkLabel = content(blocks, "proof_link_label", "");

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
    backend: content(blocks, "stack_group_backend", "Backend"),
    hardware: content(blocks, "stack_group_hardware", "Embedded"),
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
      id: "fullstack-web",
      title: content(blocks, "service_1_title", "Full-stack web app"),
      body: content(blocks, "service_1_body", ""),
      primary: true,
    },
    {
      id: "refactor-migrations",
      title: content(blocks, "service_2_title", "Refactor & migrations"),
      body: content(blocks, "service_2_body", ""),
    },
    {
      id: "integrations",
      title: content(blocks, "service_3_title", "Integrations"),
      body: content(blocks, "service_3_body", ""),
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
        availability={heroAvailability}
        primaryCta={{ label: heroPrimary, href: "#proof" }}
        secondaryCta={{ label: contactLabel, href: `/${locale}/contact` }}
      />
      <Suspense fallback={<GlobalLoader />}>
        <Proof
          locale={locale}
          eyebrow={proofEyebrow}
          heading={proofHeading}
          linkLabel={proofLinkLabel}
        />
      </Suspense>
      <Services
        eyebrow={servicesEyebrow}
        heading={servicesHeading}
        items={serviceItems}
        contactHref={`/${locale}/contact`}
      />
      <SurfacesBento
        eyebrow={surfacesEyebrow}
        heading={surfacesHeading}
        intro={surfacesIntro}
        entries={surfaceEntries}
      />
      <Suspense fallback={<GlobalLoader />}>
        <StackRow
          eyebrow={stackEyebrow}
          heading={stackHeading}
          intro={stackIntro}
          groupLabels={stackGroupLabels}
        />
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

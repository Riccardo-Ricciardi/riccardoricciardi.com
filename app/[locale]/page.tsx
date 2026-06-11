import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/hero";
import { Proof } from "@/components/site/proof/section";
import { Surfaces, type SurfaceEntry } from "@/components/site/surfaces/section";
import { Services, type ServiceItem } from "@/components/site/services/section";
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

const SURFACE_IDS = [
  "windows-desktop",
  "raspberry-pi",
  "web",
  "ios",
  "embedded-esp32",
] as const;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const isIt = locale === "it";
  const [blocks, identity] = await Promise.all([
    getContentBlocks(locale),
    getSiteIdentity(),
  ]);

  const heroTitle = content(
    blocks,
    "hero_title",
    isIt
      ? "Costruisco prodotti web che funzionano."
      : "I build web products that work."
  );
  const heroProof = content(
    blocks,
    "hero_proof_clause",
    isIt
      ? "Due sistemi girano adesso: un tool F24 usato da commercialisti veri e un motore di contenuti su un Raspberry Pi."
      : "Two systems are live right now: an F24 tool for real accountants, and a content engine on a Raspberry Pi."
  );
  const heroWordmark = content(
    blocks,
    "hero_wordmark_line",
    "RICCARDO RICCIARDI · NAPOLI"
  );
  const heroAvailability = content(
    blocks,
    "hero_availability",
    isIt ? "Napoli · disponibile" : "Naples · available"
  );
  const heroPrimary = content(
    blocks,
    "hero_cta_primary",
    isIt ? "Guarda cosa gira" : "See what's running"
  );
  const contactLabel = content(
    blocks,
    "contact_label",
    isIt ? "Scrivimi" : "Write me"
  );

  const proofHeading = content(
    blocks,
    "proof_heading",
    isIt ? "In esecuzione adesso" : "Running now"
  );
  const proofLinkLabel = content(
    blocks,
    "proof_link_label",
    isIt ? "Leggi il caso studio" : "Read the case study"
  );

  const surfacesHeading = content(
    blocks,
    "surfaces_heading",
    isIt ? "Superfici su cui rilascio" : "Surfaces I ship on"
  );
  const surfacesIntro = content(
    blocks,
    "surfaces_intro",
    isIt
      ? "Niente nuvola di competenze. Superfici su cui rilascio davvero: dietro ognuna c'è un prodotto."
      : "Not a skills cloud. Surfaces I actually ship to: each one has a product behind it."
  );

  const surfaceHref: Record<string, string | undefined> = {
    "windows-desktop": `/${locale}/work#f24-tool`,
    "raspberry-pi": `/${locale}/work#social-automation`,
    ios: `/${locale}/work#map-switch`,
    web: `/${locale}/work`,
    "embedded-esp32": `/${locale}/about`,
  };
  const surfaceEntries: SurfaceEntry[] = SURFACE_IDS.map((id) => ({
    id,
    label: content(blocks, `surface_${id}_label`, id),
    line: content(blocks, `surface_${id}_line`, ""),
    href: surfaceHref[id],
    tinted: id === "windows-desktop" || id === "raspberry-pi",
  })).filter((entry) => entry.line);

  const servicesHeading = content(
    blocks,
    "services_heading",
    isIt ? "Come posso aiutarti" : "How I can help"
  );
  const serviceItems: ServiceItem[] = [
    {
      id: "desktop-automation",
      title: content(
        blocks,
        "service_desktop-automation_title",
        isIt ? "Automazione desktop e processi" : "Desktop & process automation"
      ),
      body: content(blocks, "service_desktop-automation_body", ""),
      primary: true,
    },
    {
      id: "full-stack-product",
      title: content(
        blocks,
        "service_full-stack-product_title",
        isIt ? "Prodotto full-stack" : "Full-stack product"
      ),
      body: content(blocks, "service_full-stack-product_body", ""),
    },
    {
      id: "integrations-rescue",
      title: content(
        blocks,
        "service_integrations-rescue_title",
        isIt ? "Integrazioni e salvataggi" : "Integrations & rescue"
      ),
      body: content(blocks, "service_integrations-rescue_body", ""),
    },
  ].filter((s) => s.title && s.body);

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

  return (
    <>
      <Hero
        wordmarkLine={heroWordmark}
        availability={heroAvailability}
        title={heroTitle}
        proofClause={heroProof}
        primaryCta={{ label: heroPrimary, href: "#proof" }}
        secondaryCta={{ label: contactLabel, href: `/${locale}/contact` }}
      />
      <Suspense fallback={<GlobalLoader />}>
        <Proof locale={locale} heading={proofHeading} linkLabel={proofLinkLabel} />
      </Suspense>
      <Surfaces
        heading={surfacesHeading}
        intro={surfacesIntro}
        entries={surfaceEntries}
      />
      <Services
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

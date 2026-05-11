import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/hero";
import { Skills } from "@/components/site/skills/section";
import { Projects } from "@/components/site/projects/section";
import { GlobalLoader } from "@/components/global-loader";
import { isSupportedLanguage, type SupportedLanguage } from "@/utils/config/app";
import { APP_CONFIG } from "@/utils/config/app";
import { content, getContentBlocks } from "@/utils/content/fetch";
import { getSiteIdentity } from "@/utils/identity/fetch";

export const dynamic = "force-static";
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLanguage(locale)) notFound();

  const isIt = locale === "it";
  const [blocks, identity] = await Promise.all([
    getContentBlocks(locale as SupportedLanguage),
    getSiteIdentity(),
  ]);

  const heroEyebrow = content(
    blocks,
    "hero_eyebrow",
    isIt ? "Disponibile per nuovi progetti" : "Available for new projects"
  );
  const heroTitle = content(
    blocks,
    "hero_title",
    isIt
      ? "Costruisco prodotti web moderni e accessibili."
      : "I build modern, accessible web products."
  );
  const heroSubtitle = content(
    blocks,
    "hero_subtitle",
    isIt
      ? "Sviluppatore full-stack focalizzato su React, Next.js e architetture serverless."
      : "Full-stack developer focused on React, Next.js, and serverless architectures."
  );
  const heroPrimary = content(
    blocks,
    "hero_primary_cta",
    isIt ? "Vedi i progetti" : "View projects"
  );
  const heroSecondary = content(
    blocks,
    "hero_secondary_cta",
    isIt ? "Le mie competenze" : "My skills"
  );
  const skillsHeading = content(
    blocks,
    "skills_heading",
    isIt ? "Le mie competenze" : "My skills"
  );
  const skillsEyebrow = content(
    blocks,
    "skills_eyebrow",
    isIt ? "Stack" : "Stack"
  );
  const projectsHeading = content(
    blocks,
    "projects_heading",
    isIt ? "I miei progetti" : "My projects"
  );
  const projectsEyebrow = content(
    blocks,
    "projects_eyebrow",
    isIt ? "Lavori recenti" : "Recent work"
  );
  const projectsSubtitle = content(
    blocks,
    "projects_subtitle",
    isIt
      ? "Una selezione di lavori recenti, sincronizzata da GitHub."
      : "A selection of recent work, synced from GitHub."
  );

  return (
    <>
      <Hero
        eyebrow={heroEyebrow}
        title={heroTitle}
        subtitle={heroSubtitle}
        primaryCta={{
          label: heroPrimary,
          href: identity.primary_cta_href,
        }}
        secondaryCta={{
          label: heroSecondary,
          href: identity.secondary_cta_href,
        }}
        locale={locale}
      />
      <Suspense fallback={<GlobalLoader />}>
        <Skills
          heading={skillsHeading}
          eyebrow={skillsEyebrow}
          allLabel={isIt ? "Tutto" : "All"}
        />
      </Suspense>
      <Suspense fallback={<GlobalLoader />}>
        <Projects
          heading={projectsHeading}
          eyebrow={projectsEyebrow}
          subtitle={projectsSubtitle}
          locale={locale as SupportedLanguage}
          allLabel={isIt ? "Tutti" : "All"}
        />
      </Suspense>
    </>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return APP_CONFIG.languages.map((locale) => ({ locale }));
}

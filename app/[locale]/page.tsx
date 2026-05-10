import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { GlobalLoader } from "@/components/global-loader";
import { isSupportedLanguage, type SupportedLanguage } from "@/utils/config/app";
import { APP_CONFIG } from "@/utils/config/app";
import { content, getContentBlocks } from "@/utils/content/fetch";

export const dynamic = "force-static";
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLanguage(locale)) notFound();

  const isIt = locale === "it";
  const blocks = await getContentBlocks(locale as SupportedLanguage);

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
  const projectsHeading = content(
    blocks,
    "projects_heading",
    isIt ? "I miei progetti" : "My projects"
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
        primaryCta={{ label: heroPrimary, href: "#projects" }}
        secondaryCta={{ label: heroSecondary, href: "#skills" }}
        locale={locale}
      />
      <Suspense fallback={<GlobalLoader />}>
        <Skills heading={skillsHeading} />
      </Suspense>
      <Suspense fallback={<GlobalLoader />}>
        <Projects
          heading={projectsHeading}
          subtitle={projectsSubtitle}
          locale={locale as SupportedLanguage}
        />
      </Suspense>
    </>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return APP_CONFIG.languages.map((locale) => ({ locale }));
}

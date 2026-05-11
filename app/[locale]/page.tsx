import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/hero";
import { Skills } from "@/components/site/skills/section";
import { Projects } from "@/components/site/projects/section";
import { AboutTeaser } from "@/components/site/about/teaser";
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
    isIt ? "Hai un progetto? Parliamone" : "Got a project? Let's talk"
  );
  const heroSecondary = content(
    blocks,
    "hero_secondary_cta",
    isIt ? "Vedi i progetti" : "View projects"
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
  const aboutEyebrow = content(
    blocks,
    "about_eyebrow",
    isIt ? "Chi sono" : "About me"
  );
  const aboutHeading = content(
    blocks,
    "about_heading",
    isIt
      ? "Costruisco prodotti che le persone usano davvero."
      : "I build products people actually use."
  );
  const aboutBody = content(
    blocks,
    "about_teaser",
    isIt
      ? "Sono Riccardo. Mi piace partire da un problema vero — non da una checklist tecnica — e portarlo a un prodotto che funziona, è veloce e si capisce.\n\nLavoro come full-stack: React e Next.js davanti, Node e Supabase dietro, ma quello che conta è che il pezzo finale sia chiaro per chi lo userà."
      : "I'm Riccardo. I like to start from a real problem — not a tech checklist — and ship something that works, is fast, and makes sense.\n\nI work full-stack: React and Next.js on the front, Node and Supabase on the back. What matters is that the final piece feels obvious to whoever uses it."
  );
  const aboutReadMore = content(
    blocks,
    "about_read_more",
    isIt ? "Leggi tutto" : "Read more"
  );
  const aboutContactLabel = content(
    blocks,
    "about_contact_cta",
    isIt ? "Parliamone" : "Get in touch"
  );

  return (
    <>
      <Hero
        eyebrow={heroEyebrow}
        title={heroTitle}
        subtitle={heroSubtitle}
        primaryCta={{
          label: heroPrimary,
          href: `/${locale}/contact`,
        }}
        secondaryCta={{
          label: heroSecondary,
          href: "#projects",
        }}
        locale={locale}
      />
      <Suspense fallback={<GlobalLoader />}>
        <AboutTeaser
          locale={locale as SupportedLanguage}
          eyebrow={aboutEyebrow}
          heading={aboutHeading}
          fallbackBody={aboutBody}
          readMoreLabel={aboutReadMore}
          contactLabel={aboutContactLabel}
        />
      </Suspense>
      <Suspense fallback={<GlobalLoader />}>
        <Skills
          heading={skillsHeading}
          eyebrow={skillsEyebrow}
          allLabel={isIt ? "Tutto" : "All"}
          locale={locale}
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

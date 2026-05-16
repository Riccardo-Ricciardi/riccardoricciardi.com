import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/hero";
import { Services, SERVICE_ICONS } from "@/components/site/services/section";
import { Skills } from "@/components/site/skills/section";
import { Projects } from "@/components/site/projects/section";
import { GlobalLoader } from "@/components/global-loader";
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

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const blocks = await getContentBlocks(locale);

  const heroTitle = content(
    blocks,
    "hero_title",
    "I build modern, accessible web products."
  );
  const heroSubtitle = content(
    blocks,
    "hero_subtitle",
    "Full-stack developer focused on React, Next.js, and serverless architectures."
  );
  const heroPrimary = content(
    blocks,
    "hero_primary_cta",
    "Got a project? Let's talk"
  );
  const heroSecondary = content(blocks, "hero_secondary_cta", "View projects");
  const skillsHeading = content(blocks, "skills_heading", "My skills");
  const skillsEyebrow = content(blocks, "skills_eyebrow", "Stack");
  const skillsEmptyTitle = content(
    blocks,
    "skills_empty_title",
    locale === "it" ? "Stack in arrivo." : "Stack coming soon."
  );
  const skillsEmptyBody = content(
    blocks,
    "skills_empty_body",
    locale === "it"
      ? "Sto curando la lista degli strumenti che uso davvero."
      : "I'm curating the list of tools I actually use."
  );
  const projectsHeading = content(blocks, "projects_heading", "My projects");
  const projectsEyebrow = content(blocks, "projects_eyebrow", "Recent work");
  const projectsSubtitle = content(
    blocks,
    "projects_subtitle",
    "A selection of recent work, synced from GitHub."
  );
  const allLabel = content(blocks, "common_all", "All");
  const narrativeLabels = {
    problem: content(
      blocks,
      "projects_narrative_problem",
      locale === "it" ? "Problema" : "Problem"
    ),
    solution: content(
      blocks,
      "projects_narrative_solution",
      locale === "it" ? "Soluzione" : "Solution"
    ),
    outcome: content(
      blocks,
      "projects_narrative_outcome",
      locale === "it" ? "Risultato" : "Result"
    ),
  };

  const servicesEyebrow = content(blocks, "services_eyebrow", "Services");
  const servicesHeading = content(
    blocks,
    "services_heading",
    "How I can help"
  );
  const servicesSubtitle = content(
    blocks,
    "services_subtitle",
    "Three engagement formats. Pick what fits, or write to me with something different."
  );
  const serviceItems = [
    {
      title: content(blocks, "service_1_title", "Full-stack web app"),
      body: content(
        blocks,
        "service_1_body",
        "From idea to deploy: design, frontend, API, database, hosting."
      ),
      icon: SERVICE_ICONS[0],
    },
    {
      title: content(blocks, "service_2_title", "Refactor & migrations"),
      body: content(
        blocks,
        "service_2_body",
        "Pick up an existing codebase, untangle the parts that hurt, ship the upgrade."
      ),
      icon: SERVICE_ICONS[1],
    },
    {
      title: content(blocks, "service_3_title", "Integrations"),
      body: content(
        blocks,
        "service_3_body",
        "Auth, payments, storage, third-party APIs. Wire them into your stack."
      ),
      icon: SERVICE_ICONS[2],
    },
  ].filter((s) => s.title || s.body);

  return (
    <>
      <Hero
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
      />
      <Services
        eyebrow={servicesEyebrow}
        heading={servicesHeading}
        subtitle={servicesSubtitle}
        items={serviceItems}
      />
      <Suspense fallback={<GlobalLoader />}>
        <Skills
          heading={skillsHeading}
          eyebrow={skillsEyebrow}
          locale={locale}
          emptyTitle={skillsEmptyTitle}
          emptyBody={skillsEmptyBody}
        />
      </Suspense>
      <Suspense fallback={<GlobalLoader />}>
        <Projects
          heading={projectsHeading}
          eyebrow={projectsEyebrow}
          subtitle={projectsSubtitle}
          locale={locale}
          allLabel={allLabel}
          narrativeLabels={narrativeLabels}
        />
      </Suspense>
    </>
  );
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/hero";
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

  const heroEyebrow = content(blocks, "hero_eyebrow", "Available for new projects");
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
  const projectsHeading = content(blocks, "projects_heading", "My projects");
  const projectsEyebrow = content(blocks, "projects_eyebrow", "Recent work");
  const projectsSubtitle = content(
    blocks,
    "projects_subtitle",
    "A selection of recent work, synced from GitHub."
  );
  const allLabel = content(blocks, "common_all", "All");

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
        <Skills
          heading={skillsHeading}
          eyebrow={skillsEyebrow}
          allLabel={allLabel}
          locale={locale}
        />
      </Suspense>
      <Suspense fallback={<GlobalLoader />}>
        <Projects
          heading={projectsHeading}
          eyebrow={projectsEyebrow}
          subtitle={projectsSubtitle}
          locale={locale}
          allLabel={allLabel}
        />
      </Suspense>
    </>
  );
}

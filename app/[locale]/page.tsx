import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { GlobalLoader } from "@/components/global-loader";
import { isSupportedLanguage } from "@/utils/config/app";
import { APP_CONFIG } from "@/utils/config/app";

export const dynamic = "force-static";
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLanguage(locale)) notFound();

  const isIt = locale === "it";

  const heroCopy = isIt
    ? {
        eyebrow: "Disponibile per nuovi progetti",
        title: "Costruisco prodotti web moderni e accessibili.",
        subtitle:
          "Sviluppatore full-stack focalizzato su React, Next.js e architetture serverless. Design pulito, performance attenta, codice manutenibile.",
        primary: { label: "Vedi i progetti", href: "#projects" },
        secondary: { label: "Le mie competenze", href: "#skills" },
      }
    : {
        eyebrow: "Available for new projects",
        title: "I build modern, accessible web products.",
        subtitle:
          "Full-stack developer focused on React, Next.js, and serverless architectures. Clean design, performance-minded, maintainable code.",
        primary: { label: "View projects", href: "#projects" },
        secondary: { label: "My skills", href: "#skills" },
      };

  const skillsHeading = isIt ? "Le mie competenze" : "My skills";
  const projectsHeading = isIt ? "I miei progetti" : "My projects";
  const projectsSubtitle = isIt
    ? "Una selezione di lavori recenti, sincronizzata da GitHub."
    : "A selection of recent work, synced from GitHub.";

  return (
    <>
      <Hero
        eyebrow={heroCopy.eyebrow}
        title={heroCopy.title}
        subtitle={heroCopy.subtitle}
        primaryCta={heroCopy.primary}
        secondaryCta={heroCopy.secondary}
        locale={locale}
      />
      <Suspense fallback={<GlobalLoader />}>
        <Skills heading={skillsHeading} />
      </Suspense>
      <Suspense fallback={<GlobalLoader />}>
        <Projects
          heading={projectsHeading}
          subtitle={projectsSubtitle}
          locale={locale}
        />
      </Suspense>
    </>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return APP_CONFIG.languages.map((locale) => ({ locale }));
}

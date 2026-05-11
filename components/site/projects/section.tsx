import { getProjects } from "@/utils/projects/fetch";
import type { SupportedLanguage } from "@/utils/config/app";
import { SectionHeading } from "@/components/site/atoms/section-heading";
import { ProjectsBoard } from "@/components/site/projects/projects-board";

interface ProjectsProps {
  heading: string;
  eyebrow?: string;
  subtitle?: string;
  locale: SupportedLanguage;
  allLabel: string;
}

export async function Projects({
  heading,
  eyebrow,
  subtitle,
  locale,
  allLabel,
}: ProjectsProps) {
  const projects = await getProjects(locale);

  if (projects.length === 0) return null;

  const isIt = locale === "it";
  const narrativeLabels = {
    problem: isIt ? "Problema" : "Problem",
    solution: isIt ? "Soluzione" : "Solution",
    outcome: isIt ? "Risultato" : "Result",
  };

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="container-page section-divider-b py-16 md:py-24 lg:py-28"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="projects-heading"
        className="mb-10 md:mb-14"
      />

      <ProjectsBoard
        projects={projects}
        allLabel={allLabel}
        narrativeLabels={narrativeLabels}
      />
    </section>
  );
}

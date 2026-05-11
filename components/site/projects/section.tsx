import { getProjects } from "@/utils/projects/fetch";
import type { SupportedLanguage } from "@/utils/config/app";
import { SectionHeading } from "@/components/site/atoms/section-heading";
import { ProjectCard } from "@/components/site/projects/project-card";

interface ProjectsProps {
  heading: string;
  eyebrow?: string;
  subtitle?: string;
  locale: SupportedLanguage;
}

export async function Projects({ heading, eyebrow, subtitle, locale }: ProjectsProps) {
  const projects = await getProjects(locale);

  if (projects.length === 0) return null;

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

      <ul className="grid list-none items-start gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <li key={project.id}>
            <ProjectCard project={project} priority={i < 3} />
          </li>
        ))}
      </ul>
    </section>
  );
}

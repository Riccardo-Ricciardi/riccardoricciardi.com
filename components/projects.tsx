import { getProjects } from "@/utils/projects/fetch";
import { ProjectCard } from "@/components/project-card";
import type { SupportedLanguage } from "@/utils/config/app";

interface ProjectsProps {
  heading: string;
  subtitle?: string;
  locale: SupportedLanguage;
}

export async function Projects({ heading, subtitle, locale }: ProjectsProps) {
  const projects = await getProjects(locale);

  if (projects.length === 0) return null;

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="container-page py-16 md:py-24 lg:py-28 border-t"
    >
      <header className="mb-10 md:mb-14 max-w-2xl">
        <h2
          id="projects-heading"
          className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground"
        >
          {heading}
        </h2>
        {subtitle && (
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        )}
      </header>

      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <li key={project.id}>
            <ProjectCard project={project} priority={i < 3} />
          </li>
        ))}
      </ul>
    </section>
  );
}

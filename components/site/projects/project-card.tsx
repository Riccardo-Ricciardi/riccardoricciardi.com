import Image from "next/image";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import type { Project } from "@/utils/projects/fetch";
import { TechChip } from "@/components/site/atoms/tech-chip";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const href = project.homepage || project.url || "#";
  const imgSrc =
    project.screenshot_url ||
    project.og_image ||
    `https://opengraph.githubassets.com/1/${project.repo}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-dashed border-dashed-soft bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-blue hover:shadow-[0_0_0_1px_var(--accent-blue-soft),0_8px_24px_-12px_rgb(0_0_0_/_0.18)]">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`${project.name ?? project.repo} — open project`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-dashed border-dashed-soft bg-muted/30">
          <Image
            src={imgSrc}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            priority={priority}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <header className="flex items-start justify-between gap-3">
            <h3 className="font-mono text-sm font-medium tracking-tight text-foreground">
              {project.name ?? project.repo}
            </h3>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-blue"
              aria-hidden="true"
            />
          </header>

          {project.description && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}

          {project.topics && project.topics.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {project.topics.slice(0, 4).map((topic) => (
                <li key={topic}>
                  <TechChip>{topic}</TechChip>
                </li>
              ))}
            </ul>
          )}

          <footer className="mt-auto flex items-center gap-4 pt-2 text-xs text-muted-foreground">
            {project.language && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-foreground/60"
                />
                {project.language}
              </span>
            )}
            {project.stars != null && project.stars > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3" aria-hidden="true" />
                {project.stars}
              </span>
            )}
            {project.forks != null && project.forks > 0 && (
              <span className="inline-flex items-center gap-1">
                <GitFork className="h-3 w-3" aria-hidden="true" />
                {project.forks}
              </span>
            )}
          </footer>
        </div>
      </a>
    </article>
  );
}

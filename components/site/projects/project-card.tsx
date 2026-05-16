import Image from "next/image";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import type { Project } from "@/utils/projects/fetch";
import { TechChip } from "@/components/site/atoms/tech-chip";
import { Eyebrow } from "@/components/site/atoms/eyebrow";

export interface NarrativeLabels {
  problem: string;
  solution: string;
  outcome: string;
}

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
  labels: NarrativeLabels;
}

export function ProjectCard({ project, priority = false, labels }: ProjectCardProps) {
  const href = project.homepage || project.url || "#";
  const imgSrc =
    project.screenshot_url ||
    project.og_image ||
    `https://opengraph.githubassets.com/1/${project.repo}`;

  const hasNarrative = Boolean(
    project.problem || project.solution || project.outcome
  );

  return (
    <article className="group card-base card-interactive card-flush flex flex-col overflow-hidden">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`${project.name ?? project.repo} — open project`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-dashed-soft bg-muted/30">
          <Image
            src={imgSrc}
            alt=""
            aria-hidden="true"
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
            <h3 className="text-h4 text-foreground">
              {project.name ?? project.repo}
            </h3>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-blue"
              aria-hidden="true"
            />
          </header>

          {project.description && !hasNarrative && (
            <p className="text-body-sm line-clamp-3 text-muted-foreground">
              {project.description}
            </p>
          )}

          {hasNarrative && (
            <dl className="text-body-sm flex flex-col gap-2.5">
              {project.problem && (
                <NarrativeRow label={labels.problem} value={project.problem} tone="muted" />
              )}
              {project.solution && (
                <NarrativeRow label={labels.solution} value={project.solution} tone="foreground" />
              )}
              {project.outcome && (
                <NarrativeRow label={labels.outcome} value={project.outcome} tone="accent" />
              )}
            </dl>
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

          {(() => {
            const hasLanguage = Boolean(project.language);
            const hasStars =
              project.stars != null && project.stars > 0;
            const hasForks =
              project.forks != null && project.forks > 0;
            if (!hasLanguage && !hasStars && !hasForks) return null;
            return (
              <footer className="text-caption mt-auto flex items-center gap-4 pt-2 text-muted-foreground">
                {hasLanguage && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-foreground/60"
                    />
                    {project.language}
                  </span>
                )}
                {hasStars && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3" aria-hidden="true" />
                    {project.stars}
                  </span>
                )}
                {hasForks && (
                  <span className="inline-flex items-center gap-1">
                    <GitFork className="h-3 w-3" aria-hidden="true" />
                    {project.forks}
                  </span>
                )}
              </footer>
            );
          })()}
        </div>
      </a>
    </article>
  );
}

interface NarrativeRowProps {
  label: string;
  value: string;
  tone: "muted" | "foreground" | "accent";
}

function NarrativeRow({ label, value, tone }: NarrativeRowProps) {
  const valueClass =
    tone === "accent"
      ? "text-foreground"
      : tone === "foreground"
        ? "text-foreground/90"
        : "text-muted-foreground";
  const labelClass =
    tone === "accent" ? "text-accent-blue" : undefined;
  return (
    <div className="flex flex-col gap-0.5">
      <Eyebrow as="dt" className={labelClass}>
        {label}
      </Eyebrow>
      <dd className={`line-clamp-2 ${valueClass}`}>{value}</dd>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/utils/projects/fetch";
import { ProjectCard, type NarrativeLabels } from "@/components/site/projects/project-card";
import { cn } from "@/utils/cn";

interface ProjectsBoardProps {
  projects: Project[];
  allLabel: string;
  narrativeLabels: NarrativeLabels;
}

export function ProjectsBoard({ projects, allLabel, narrativeLabels }: ProjectsBoardProps) {
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      for (const t of p.topics ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .filter(([, n]) => n >= 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([t]) => t);
  }, [projects]);

  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!active) return projects;
    return projects.filter((p) => (p.topics ?? []).includes(active));
  }, [projects, active]);

  return (
    <div className="flex flex-col gap-6">
      {topics.length > 0 && (
        <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
          <FilterChip
            label={allLabel}
            active={active === null}
            onClick={() => setActive(null)}
          />
          {topics.map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={active === t}
              onClick={() => setActive(t)}
            />
          ))}
        </div>
      )}

      <ul className="grid list-none items-start gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project, i) => (
          <li key={project.id}>
            <ProjectCard project={project} priority={i < 3} labels={narrativeLabels} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "pill-base pill-mono pill-interactive",
        active && "pill-accent"
      )}
    >
      {label}
    </button>
  );
}

import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

export function SkillsVariantJ({ skills }: VariantProps) {
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {sorted.map((skill) => (
        <li
          key={skill.id}
          className="group card-base flex flex-col justify-between gap-4 p-5 transition-colors duration-150 ease-out hover:border-foreground/30"
        >
          <span
            className="font-mono text-4xl font-bold leading-none tracking-tight text-foreground tabular-nums sm:text-5xl"
            aria-label={`${skill.percentage} percent`}
          >
            {skill.percentage}
            <span className="text-xl text-muted-foreground sm:text-2xl">%</span>
          </span>
          <span className="truncate text-sm font-medium tracking-tight text-foreground">
            {skill.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

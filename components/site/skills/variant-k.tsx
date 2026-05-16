import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

export function SkillsVariantK({ skills }: VariantProps) {
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul className="grid list-none grid-cols-1 gap-x-10 gap-y-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((skill) => (
        <li key={skill.id} className="group flex flex-col gap-2">
          <span className="flex items-baseline justify-between gap-3">
            <span className="truncate text-base font-medium tracking-tight text-foreground sm:text-lg">
              {skill.name}
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {skill.percentage}%
            </span>
          </span>
          <span
            aria-hidden="true"
            className="relative h-px w-full overflow-hidden bg-border"
          >
            <span
              className="absolute inset-y-0 left-0 bg-foreground transition-[width] duration-300 ease-out group-hover:bg-accent-blue"
              style={{ width: `${skill.percentage}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

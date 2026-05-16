import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

export function SkillsVariantC({ skills }: VariantProps) {
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul className="grid list-none grid-cols-2 gap-x-6 gap-y-5 p-0 sm:grid-cols-3 md:grid-cols-4">
      {sorted.map((skill) => (
        <li
          key={skill.id}
          className="group flex items-center gap-3 transition-colors duration-150 ease-out"
        >
          <span
            aria-hidden="true"
            className="h-6 w-px shrink-0 bg-border transition-colors duration-150 ease-out group-hover:bg-accent-blue sm:h-7"
          />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-base font-semibold tracking-tight text-foreground transition-colors duration-150 ease-out group-hover:text-accent-blue sm:text-lg">
              {skill.name}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {skill.percentage}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

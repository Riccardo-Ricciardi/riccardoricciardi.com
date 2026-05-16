import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

export function SkillsVariantI({ skills }: VariantProps) {
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul className="list-none border-y border-foreground p-0">
      {sorted.map((skill) => (
        <li
          key={skill.id}
          className="group flex items-baseline justify-between gap-4 border-b border-foreground/15 px-1 py-4 transition-colors duration-150 ease-out last:border-b-0 hover:bg-foreground hover:text-background"
        >
          <span className="truncate font-mono text-base uppercase tracking-[0.18em] sm:text-lg">
            {skill.name}
          </span>
          <span className="shrink-0 font-mono text-base tabular-nums sm:text-lg">
            {skill.percentage}
            <span className="text-xs opacity-60">%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

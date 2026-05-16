import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

export function SkillsVariantL({ skills }: VariantProps) {
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul className="list-none p-0 [font-feature-settings:'tnum']">
      {sorted.map((skill) => (
        <li
          key={skill.id}
          className="flex items-baseline gap-3 py-2 text-base sm:text-lg"
        >
          <span className="font-serif font-medium tracking-tight text-foreground">
            {skill.name}
          </span>
          <span
            aria-hidden="true"
            className="flex-1 translate-y-[-0.25em] border-b border-dotted border-muted-foreground/60"
          />
          <span className="font-mono text-xs tabular-nums text-muted-foreground sm:text-sm">
            {skill.percentage}%
          </span>
        </li>
      ))}
    </ul>
  );
}

import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

function brandHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export function SkillsVariantB({ skills }: VariantProps) {
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul className="grid list-none grid-cols-1 gap-x-8 gap-y-0 p-0 md:grid-cols-2 lg:grid-cols-3">
      {sorted.map((skill) => {
        const hue = brandHue(skill.name);
        return (
          <li
            key={skill.id}
            className="group flex items-center justify-between gap-3 border-b border-border/60 py-3 transition-colors duration-150 ease-out hover:border-foreground/30"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full transition-transform duration-150 ease-out group-hover:scale-125"
                style={{ backgroundColor: `oklch(0.68 0.16 ${hue})` }}
              />
              <span className="truncate text-sm font-medium text-foreground sm:text-base">
                {skill.name}
              </span>
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {skill.percentage}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

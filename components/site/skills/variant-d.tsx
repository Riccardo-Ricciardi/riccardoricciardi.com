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

export function SkillsVariantD({ skills }: VariantProps) {
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul
      className="grid list-none gap-1.5 p-0"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}
    >
      {sorted.map((skill) => {
        const hue = brandHue(skill.name);
        const t = skill.percentage / 100;
        const lightness = 0.9 - t * 0.32;
        const chroma = 0.04 + t * 0.16;
        const bg = `oklch(${lightness} ${chroma} ${hue})`;
        const fg = lightness < 0.65 ? "oklch(0.98 0 0)" : "oklch(0.18 0 0)";
        return (
          <li
            key={skill.id}
            className="group relative aspect-square overflow-hidden rounded-md transition-transform duration-150 ease-out hover:-translate-y-0.5"
            style={{ backgroundColor: bg }}
            title={`${skill.name} · ${skill.percentage}%`}
          >
            <span
              className="absolute inset-0 flex items-end justify-start p-2 text-[11px] font-semibold leading-tight tracking-tight"
              style={{ color: fg }}
            >
              <span className="line-clamp-2 break-words">{skill.name}</span>
            </span>
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 font-mono text-[10px] tabular-nums opacity-80"
              style={{ color: fg }}
            >
              {skill.percentage}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

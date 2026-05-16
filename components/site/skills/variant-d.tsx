import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

type TierId = "core" | "proficient" | "familiar";

const TIER_META: Record<
  TierId,
  { it: string; en: string; chroma: number; lightness: number }
> = {
  core: { it: "Core", en: "Core", chroma: 0.18, lightness: 0.58 },
  proficient: { it: "Pratico", en: "Proficient", chroma: 0.1, lightness: 0.72 },
  familiar: { it: "Familiare", en: "Familiar", chroma: 0.04, lightness: 0.85 },
};

function tierFor(percentage: number): TierId {
  if (percentage >= 85) return "core";
  if (percentage >= 60) return "proficient";
  return "familiar";
}

function brandHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export function SkillsVariantD({ skills, locale = "it" }: VariantProps) {
  const lang = locale === "it" ? "it" : "en";
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="flex flex-col gap-6">
      <ul
        className="grid list-none gap-1.5 p-0"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}
      >
        {sorted.map((skill) => {
          const tier = tierFor(skill.percentage);
          const hue = brandHue(skill.name);
          const { chroma, lightness } = TIER_META[tier];
          const bg = `oklch(${lightness} ${chroma} ${hue})`;
          const fg =
            tier === "familiar"
              ? "oklch(0.25 0 0)"
              : tier === "proficient"
                ? "oklch(0.2 0 0)"
                : "oklch(0.98 0 0)";
          return (
            <li
              key={skill.id}
              className="group relative aspect-square overflow-hidden rounded-md transition-transform duration-150 ease-out hover:-translate-y-0.5"
              style={{ backgroundColor: bg }}
              title={`${skill.name} · ${TIER_META[tier][lang]}`}
            >
              <span
                className="absolute inset-0 flex items-end justify-start p-2 text-[11px] font-semibold leading-tight tracking-tight"
                style={{ color: fg }}
              >
                <span className="line-clamp-2 break-words">{skill.name}</span>
              </span>
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 font-mono text-[9px] tabular-nums opacity-70"
                style={{ color: fg }}
              >
                {skill.percentage}
              </span>
            </li>
          );
        })}
      </ul>

      <ul className="flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
        {(["core", "proficient", "familiar"] as const).map((t) => (
          <li
            key={t}
            className="inline-flex items-center gap-2 text-body-sm text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor: `oklch(${TIER_META[t].lightness} ${TIER_META[t].chroma} 250)`,
              }}
            />
            <span className="font-medium text-foreground">
              {TIER_META[t][lang]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

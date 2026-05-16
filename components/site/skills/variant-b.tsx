import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

type TierId = "core" | "proficient" | "familiar";

const TIER_META: Record<
  TierId,
  { it: string; en: string; cadenceIt: string; cadenceEn: string; color: string }
> = {
  core: {
    it: "Core",
    en: "Core",
    cadenceIt: "Quotidiano",
    cadenceEn: "Daily",
    color: "oklch(0.62 0.20 263)",
  },
  proficient: {
    it: "Pratico",
    en: "Proficient",
    cadenceIt: "Regolare",
    cadenceEn: "Regular",
    color: "oklch(0.70 0.16 165)",
  },
  familiar: {
    it: "Familiare",
    en: "Familiar",
    cadenceIt: "Occasionale",
    cadenceEn: "Occasional",
    color: "oklch(0.65 0.05 280)",
  },
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

export function SkillsVariantB({ skills, locale = "it" }: VariantProps) {
  const lang = locale === "it" ? "it" : "en";
  const total = skills.length;

  const counts: Record<TierId, number> = { core: 0, proficient: 0, familiar: 0 };
  for (const s of skills) counts[tierFor(s.percentage)]++;

  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {(["core", "proficient", "familiar"] as const).map((t) => {
            const pct = total === 0 ? 0 : (counts[t] / total) * 100;
            if (pct === 0) return null;
            return (
              <span
                key={t}
                style={{ width: `${pct}%`, backgroundColor: TIER_META[t].color }}
                aria-hidden="true"
              />
            );
          })}
        </div>
        <ul className="mt-3 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
          {(["core", "proficient", "familiar"] as const).map((t) => {
            const pct = total === 0 ? 0 : Math.round((counts[t] / total) * 100);
            return (
              <li
                key={t}
                className="inline-flex items-center gap-2 text-body-sm text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: TIER_META[t].color }}
                />
                <span className="font-medium text-foreground">
                  {TIER_META[t][lang]}
                </span>
                <span className="font-mono tabular-nums">
                  {counts[t]} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="grid list-none grid-cols-1 gap-x-8 gap-y-0 p-0 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((skill) => {
          const tier = tierFor(skill.percentage);
          const hue = brandHue(skill.name);
          const cadence =
            lang === "it"
              ? TIER_META[tier].cadenceIt
              : TIER_META[tier].cadenceEn;
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
              <span
                className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums"
                aria-hidden="true"
              >
                {cadence}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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
  core: { it: "Core", en: "Core", chroma: 0.16, lightness: 0.6 },
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

function categoryLabel(raw: string | null, lang: "it" | "en"): string {
  if (!raw || raw.trim().length === 0) {
    return lang === "it" ? "Altro" : "Other";
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function SkillsVariantG({ skills, locale = "it" }: VariantProps) {
  const lang = locale === "it" ? "it" : "en";

  const lanes = new Map<string, Skill[]>();
  for (const s of skills) {
    const key = (s.category ?? "").toLowerCase() || "other";
    const arr = lanes.get(key) ?? [];
    arr.push(s);
    lanes.set(key, arr);
  }

  const laneEntries = Array.from(lanes.entries())
    .map(([key, items]) => ({
      key,
      label: categoryLabel(items[0]?.category ?? null, lang),
      items: [...items].sort((a, b) => b.percentage - a.percentage),
    }))
    .sort((a, b) => b.items.length - a.items.length);

  return (
    <div className="flex flex-col gap-10">
      {laneEntries.map((lane) => (
        <section
          key={lane.key}
          aria-labelledby={`vg-${lane.key}`}
          className="grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr] md:gap-8"
        >
          <header className="flex flex-col gap-1 md:sticky md:top-24 md:self-start">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {String(lane.items.length).padStart(2, "0")} ·{" "}
              {lane.items.length === 1
                ? lang === "it"
                  ? "voce"
                  : "item"
                : lang === "it"
                  ? "voci"
                  : "items"}
            </span>
            <h3
              id={`vg-${lane.key}`}
              className="text-h3 tracking-tight text-foreground"
            >
              {lane.label}
            </h3>
          </header>

          <ul className="flex list-none flex-wrap gap-2 border-t border-border pt-4 p-0 md:border-t-0 md:pt-0">
            {lane.items.map((skill) => {
              const tier = tierFor(skill.percentage);
              const hue = brandHue(skill.name);
              const { chroma, lightness } = TIER_META[tier];
              const bg = `oklch(${lightness} ${chroma} ${hue})`;
              const fg =
                tier === "core"
                  ? "oklch(0.98 0 0)"
                  : "oklch(0.18 0 0)";
              return (
                <li
                  key={skill.id}
                  className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium tracking-tight transition-transform duration-150 ease-out hover:-translate-y-0.5"
                  style={{ backgroundColor: bg, color: fg }}
                  title={`${skill.name} · ${TIER_META[tier][lang]}`}
                >
                  <span>{skill.name}</span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[10px] tabular-nums opacity-70"
                  >
                    {skill.percentage}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

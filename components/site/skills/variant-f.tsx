import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

type TierId = "core" | "proficient" | "familiar";

const TIER_LABEL: Record<TierId, { it: string; en: string }> = {
  core: { it: "Core", en: "Core" },
  proficient: { it: "Pratico", en: "Proficient" },
  familiar: { it: "Familiare", en: "Familiar" },
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

function sizeFor(percentage: number): string {
  if (percentage >= 90) return "clamp(2rem, 1rem + 3vw, 3.75rem)";
  if (percentage >= 80) return "clamp(1.5rem, 0.8rem + 2vw, 2.5rem)";
  if (percentage >= 70) return "clamp(1.25rem, 0.7rem + 1.4vw, 1.875rem)";
  if (percentage >= 55) return "clamp(1rem, 0.7rem + 0.8vw, 1.375rem)";
  return "clamp(0.875rem, 0.7rem + 0.4vw, 1.125rem)";
}

function weightFor(percentage: number): number {
  if (percentage >= 85) return 700;
  if (percentage >= 60) return 600;
  return 400;
}

export function SkillsVariantF({ skills, locale = "it" }: VariantProps) {
  const lang = locale === "it" ? "it" : "en";
  const shuffled = [...skills].sort((a, b) => {
    const diff = b.percentage - a.percentage;
    if (Math.abs(diff) > 15) return diff;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-3 px-2 py-6 leading-[1.05] sm:gap-x-7 sm:py-10"
        aria-label={lang === "it" ? "Nuvola di competenze" : "Skills cloud"}
      >
        {shuffled.map((skill) => {
          const tier = tierFor(skill.percentage);
          const hue = brandHue(skill.name);
          const color =
            tier === "core"
              ? "var(--foreground)"
              : tier === "proficient"
                ? `oklch(0.55 0.14 ${hue})`
                : "var(--muted-foreground)";
          return (
            <span
              key={skill.id}
              className="inline-block whitespace-nowrap tracking-tight transition-colors duration-150 ease-out hover:!text-accent-blue"
              style={{
                fontSize: sizeFor(skill.percentage),
                fontWeight: weightFor(skill.percentage),
                color,
                fontStyle: tier === "familiar" ? "italic" : "normal",
              }}
              title={`${skill.name} · ${TIER_LABEL[tier][lang]}`}
            >
              {skill.name}
            </span>
          );
        })}
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {lang === "it"
          ? "Dimensione = profondità · grassetto = core · corsivo = familiare"
          : "Size = depth · bold = core · italic = familiar"}
      </p>
    </div>
  );
}

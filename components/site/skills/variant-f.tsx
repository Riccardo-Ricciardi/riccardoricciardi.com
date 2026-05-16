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
  const ordered = [...skills].sort((a, b) => {
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
        {ordered.map((skill) => {
          const hue = brandHue(skill.name);
          const opacity = 0.45 + (skill.percentage / 100) * 0.55;
          return (
            <span
              key={skill.id}
              className="group inline-flex items-baseline gap-1 whitespace-nowrap tracking-tight transition-colors duration-150 ease-out hover:!text-accent-blue"
              style={{
                fontSize: sizeFor(skill.percentage),
                fontWeight: weightFor(skill.percentage),
                color: `oklch(0.5 0.12 ${hue} / ${opacity})`,
              }}
              title={`${skill.name} · ${skill.percentage}%`}
            >
              <span>{skill.name}</span>
              <sup
                className="font-mono text-[0.4em] tabular-nums opacity-70"
                aria-hidden="true"
              >
                {skill.percentage}
              </sup>
            </span>
          );
        })}
      </div>
    </div>
  );
}

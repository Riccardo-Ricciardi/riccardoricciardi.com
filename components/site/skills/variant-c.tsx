import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

type TierId = "core" | "proficient" | "familiar";

const TIER_LABEL: Record<TierId, { it: string; en: string }> = {
  core: { it: "Stack principale", en: "Core stack" },
  proficient: { it: "A mio agio", en: "Proficient" },
  familiar: { it: "Familiari", en: "Familiar" },
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

export function SkillsVariantC({ skills, locale = "it" }: VariantProps) {
  const lang = locale === "it" ? "it" : "en";

  const grouped: Record<TierId, Skill[]> = {
    core: [],
    proficient: [],
    familiar: [],
  };
  for (const s of skills) grouped[tierFor(s.percentage)].push(s);

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {grouped.core.length > 0 && (
        <section aria-labelledby="vc-core">
          <header className="mb-6 flex items-baseline gap-3">
            <span className="text-eyebrow tabular-nums text-muted-foreground">
              01
            </span>
            <h3 id="vc-core" className="text-eyebrow text-muted-foreground">
              {TIER_LABEL.core[lang]}
            </h3>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </header>
          <ul className="grid list-none grid-cols-2 gap-x-6 gap-y-5 p-0 sm:grid-cols-3 md:grid-cols-4">
            {grouped.core.map((skill) => (
              <li
                key={skill.id}
                className="group flex items-center gap-3 transition-colors duration-150 ease-out"
              >
                <span
                  aria-hidden="true"
                  className="h-6 w-px shrink-0 bg-border transition-colors duration-150 ease-out group-hover:bg-accent-blue sm:h-7"
                />
                <span className="truncate text-base font-semibold tracking-tight text-foreground transition-colors duration-150 ease-out group-hover:text-accent-blue sm:text-lg md:text-xl">
                  {skill.name}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {grouped.proficient.length > 0 && (
        <section aria-labelledby="vc-proficient">
          <header className="mb-5 flex items-baseline gap-3">
            <span className="text-eyebrow tabular-nums text-muted-foreground">
              02
            </span>
            <h3
              id="vc-proficient"
              className="text-eyebrow text-muted-foreground"
            >
              {TIER_LABEL.proficient[lang]}
            </h3>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </header>
          <ul className="flex list-none flex-wrap gap-2 p-0">
            {grouped.proficient.map((skill) => {
              const hue = brandHue(skill.name);
              return (
                <li
                  key={skill.id}
                  className="pill-base pill-mono pill-interactive"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `oklch(0.68 0.16 ${hue})` }}
                  />
                  <span>{skill.name}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {grouped.familiar.length > 0 && (
        <section aria-labelledby="vc-familiar">
          <header className="mb-4 flex items-baseline gap-3">
            <span className="text-eyebrow tabular-nums text-muted-foreground">
              03
            </span>
            <h3
              id="vc-familiar"
              className="text-eyebrow text-muted-foreground"
            >
              {TIER_LABEL.familiar[lang]}
            </h3>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </header>
          <p className="font-mono text-sm leading-relaxed text-muted-foreground">
            {grouped.familiar.map((s, i) => (
              <span key={s.id}>
                <span className="text-foreground">{s.name}</span>
                {i < grouped.familiar.length - 1 && (
                  <span aria-hidden="true"> · </span>
                )}
              </span>
            ))}
          </p>
        </section>
      )}
    </div>
  );
}

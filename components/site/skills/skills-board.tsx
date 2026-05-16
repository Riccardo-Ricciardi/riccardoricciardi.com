import Image from "next/image";
import type { Skill } from "@/utils/skills/fetch";
import { SkillCard } from "@/components/site/skills/skill-card";
import { getSupabaseImageUrl } from "@/utils/env";

interface SkillsBoardProps {
  skills: Skill[];
  locale?: string;
}

type TierId = "core" | "proficient" | "familiar";

interface TierMeta {
  id: TierId;
  threshold: number;
  label: { it: string; en: string };
  caption: { it: string; en: string };
}

const TIERS: TierMeta[] = [
  {
    id: "core",
    threshold: 85,
    label: { it: "Stack principale", en: "Core stack" },
    caption: {
      it: "Strumenti che uso ogni giorno, con cui spedisco prodotti reali.",
      en: "Tools I use daily to ship real products.",
    },
  },
  {
    id: "proficient",
    threshold: 60,
    label: { it: "A mio agio", en: "Proficient" },
    caption: {
      it: "Tecnologie con cui ho lavorato su progetti completi.",
      en: "Tech I've shipped full projects with.",
    },
  },
  {
    id: "familiar",
    threshold: 0,
    label: { it: "Familiari", en: "Familiar" },
    caption: {
      it: "Strumenti che conosco e su cui so muovermi quando serve.",
      en: "Tools I know and can pick up when needed.",
    },
  },
];

const BASE_URL = getSupabaseImageUrl();

function tierFor(percentage: number): TierId {
  if (percentage >= 85) return "core";
  if (percentage >= 60) return "proficient";
  return "familiar";
}

export function SkillsBoard({ skills, locale = "it" }: SkillsBoardProps) {
  const grouped = new Map<TierId, Skill[]>([
    ["core", []],
    ["proficient", []],
    ["familiar", []],
  ]);
  for (const s of skills) {
    grouped.get(tierFor(s.percentage))?.push(s);
  }

  if (skills.length === 0) {
    return <p className="text-muted-foreground">—</p>;
  }

  const lang = locale === "it" ? "it" : "en";

  return (
    <div className="flex flex-col gap-14">
      {TIERS.map((tier) => {
        const items = grouped.get(tier.id) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={tier.id} aria-labelledby={`skills-tier-${tier.id}`}>
            <header className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-eyebrow tabular-nums">
                  {String(TIERS.indexOf(tier) + 1).padStart(2, "0")}
                </span>
                <h3 id={`skills-tier-${tier.id}`} className="text-h3">
                  {tier.label[lang]}
                </h3>
                <span className="text-eyebrow tabular-nums">
                  {items.length}
                </span>
              </div>
              <p className="text-body-sm max-w-md text-muted-foreground">
                {tier.caption[lang]}
              </p>
            </header>

            {tier.id === "core" && (
              <ul className="grid list-none gap-4 p-0 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                {items.map((skill, i) => (
                  <SkillCard
                    key={skill.id}
                    id={skill.id}
                    name={skill.name}
                    percentage={skill.percentage}
                    dark={skill.dark}
                    icon_url={skill.icon_url}
                    icon_dark_url={skill.icon_dark_url}
                    priority={i < 6}
                  />
                ))}
              </ul>
            )}

            {tier.id === "proficient" && (
              <ul className="grid list-none gap-3 p-0 sm:gap-4 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
                {items.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    id={skill.id}
                    name={skill.name}
                    percentage={skill.percentage}
                    dark={skill.dark}
                    icon_url={skill.icon_url}
                    icon_dark_url={skill.icon_dark_url}
                  />
                ))}
              </ul>
            )}

            {tier.id === "familiar" && (
              <ul className="flex list-none flex-wrap gap-2 p-0">
                {items.map((skill) => (
                  <FamiliarChip key={skill.id} skill={skill} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function FamiliarChip({ skill }: { skill: Skill }) {
  const lightSrc = skill.icon_url ?? `${BASE_URL}/${skill.name}.png`;
  const darkSrc = skill.icon_dark_url ?? `${BASE_URL}/${skill.name}-dark.png`;
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-dashed-soft bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent-blue">
      <span className="relative h-4 w-4 shrink-0">
        <Image
          src={lightSrc}
          alt=""
          aria-hidden="true"
          fill
          sizes="16px"
          className={skill.dark ? "object-contain dark:hidden" : "object-contain"}
        />
        {skill.dark && (
          <Image
            src={darkSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="16px"
            className="hidden object-contain dark:block"
          />
        )}
      </span>
      <span className="font-mono tracking-wide">{skill.name}</span>
    </li>
  );
}

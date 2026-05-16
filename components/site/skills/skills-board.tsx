import { Sparkles } from "lucide-react";
import type { Skill } from "@/utils/skills/fetch";
import { EmptyState } from "@/components/site/atoms/empty-state";

interface SkillsBoardProps {
  skills: Skill[];
  locale?: string;
  emptyTitle?: string;
  emptyBody?: string;
}

type TierId = "core" | "proficient" | "familiar";

interface TierMeta {
  id: TierId;
  threshold: number;
  label: { it: string; en: string };
  caption: { it: string; en: string };
  cadence: { it: string; en: string };
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
    cadence: { it: "Quotidiano", en: "Daily" },
  },
  {
    id: "proficient",
    threshold: 60,
    label: { it: "A mio agio", en: "Proficient" },
    caption: {
      it: "Tecnologie con cui ho lavorato su progetti completi.",
      en: "Tech I've shipped full projects with.",
    },
    cadence: { it: "Regolare", en: "Regular" },
  },
  {
    id: "familiar",
    threshold: 0,
    label: { it: "Familiari", en: "Familiar" },
    caption: {
      it: "Strumenti che conosco e su cui so muovermi quando serve.",
      en: "Tools I know and can pick up when needed.",
    },
    cadence: { it: "Occasionale", en: "Occasional" },
  },
];

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

export function SkillsBoard({
  skills,
  locale = "it",
  emptyTitle,
  emptyBody,
}: SkillsBoardProps) {
  const lang = locale === "it" ? "it" : "en";

  if (skills.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title={
          emptyTitle ??
          (lang === "it" ? "Stack in arrivo." : "Stack coming soon.")
        }
        description={
          emptyBody ??
          (lang === "it"
            ? "Sto curando la lista degli strumenti che uso davvero."
            : "I'm curating the list of tools I actually use.")
        }
        className="self-start"
      />
    );
  }

  const grouped = new Map<TierId, Skill[]>([
    ["core", []],
    ["proficient", []],
    ["familiar", []],
  ]);
  for (const s of skills) {
    grouped.get(tierFor(s.percentage))?.push(s);
  }

  return (
    <div className="flex flex-col gap-y-16 md:gap-y-20">
      {TIERS.map((tier, tierIndex) => {
        const items = grouped.get(tier.id) ?? [];
        if (items.length === 0) return null;

        return (
          <section
            key={tier.id}
            aria-labelledby={`skills-tier-${tier.id}`}
            className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12"
          >
            <header className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-baseline gap-3">
                <span className="text-eyebrow tabular-nums text-muted-foreground">
                  {String(tierIndex + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-px flex-1 bg-border lg:max-w-12"
                  aria-hidden="true"
                />
                <span className="text-eyebrow tabular-nums text-muted-foreground">
                  {String(items.length).padStart(2, "0")}
                </span>
              </div>
              <h3
                id={`skills-tier-${tier.id}`}
                className="text-h3 mt-3 tracking-tight"
              >
                {tier.label[lang]}
              </h3>
              <p className="text-body-sm mt-2 text-muted-foreground lg:max-w-xs">
                {tier.caption[lang]}
              </p>
            </header>

            <div className="lg:col-span-9">
              {tier.id === "familiar" ? (
                <FamiliarCloud items={items} />
              ) : (
                <SkillIndex items={items} cadence={tier.cadence[lang]} />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

interface SkillIndexProps {
  items: Skill[];
  cadence: string;
}

function SkillIndex({ items, cadence }: SkillIndexProps) {
  return (
    <ul className="grid list-none grid-cols-1 gap-x-8 gap-y-0 p-0 sm:grid-cols-2">
      {items.map((skill) => (
        <SkillRow key={skill.id} skill={skill} cadence={cadence} />
      ))}
    </ul>
  );
}

interface SkillRowProps {
  skill: Skill;
  cadence: string;
}

function SkillRow({ skill, cadence }: SkillRowProps) {
  const hue = brandHue(skill.name);
  return (
    <li className="group relative flex items-center justify-between gap-4 border-b border-border/60 py-3.5 transition-colors duration-150 ease-out hover:border-foreground/30 sm:py-4">
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          aria-hidden="true"
          className="h-5 w-[3px] shrink-0 rounded-full transition-all duration-150 ease-out group-hover:h-7 group-hover:w-[4px] sm:h-6"
          style={{ backgroundColor: `oklch(0.68 0.16 ${hue})` }}
        />
        <span className="truncate text-base font-medium tracking-tight text-foreground transition-colors duration-150 ease-out group-hover:text-accent-blue sm:text-lg">
          {skill.name}
        </span>
      </div>
      <span
        className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums sm:text-[11px]"
        aria-hidden="true"
      >
        {cadence}
      </span>
    </li>
  );
}

function FamiliarCloud({ items }: { items: Skill[] }) {
  return (
    <ul className="flex list-none flex-wrap gap-x-5 gap-y-3 p-0">
      {items.map((skill) => {
        const hue = brandHue(skill.name);
        return (
          <li
            key={skill.id}
            className="group inline-flex items-center gap-2 transition-colors duration-150 ease-out"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-150 ease-out group-hover:h-2 group-hover:w-2"
              style={{ backgroundColor: `oklch(0.68 0.16 ${hue})` }}
            />
            <span className="font-mono text-xs tracking-wide text-muted-foreground transition-colors duration-150 ease-out group-hover:text-foreground">
              {skill.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

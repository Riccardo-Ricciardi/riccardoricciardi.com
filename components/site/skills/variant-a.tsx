import Image from "next/image";
import type { Skill } from "@/utils/skills/fetch";
import { getSupabaseImageUrl } from "@/utils/env";

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

const BASE_URL = getSupabaseImageUrl();

function tierFor(percentage: number): TierId {
  if (percentage >= 85) return "core";
  if (percentage >= 60) return "proficient";
  return "familiar";
}

export function SkillsVariantA({ skills, locale = "it" }: VariantProps) {
  const lang = locale === "it" ? "it" : "en";
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {sorted.map((skill, i) => {
        const tier = tierFor(skill.percentage);
        const lightSrc = skill.icon_url ?? `${BASE_URL}/${skill.name}.png`;
        const darkSrc =
          skill.icon_dark_url ?? `${BASE_URL}/${skill.name}-dark.png`;
        return (
          <li
            key={skill.id}
            className="group card-base card-interactive flex items-center gap-3 p-4"
          >
            <div className="relative h-9 w-9 shrink-0">
              <Image
                src={lightSrc}
                alt=""
                aria-hidden="true"
                fill
                sizes="36px"
                className={
                  skill.dark
                    ? "object-contain dark:hidden"
                    : "object-contain"
                }
                priority={i < 8}
              />
              {skill.dark && (
                <Image
                  src={darkSrc}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="36px"
                  className="hidden object-contain dark:block"
                  priority={i < 8}
                />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium tracking-tight text-foreground">
                {skill.name}
              </span>
              <span className="text-eyebrow tabular-nums text-muted-foreground">
                {TIER_LABEL[tier][lang]}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

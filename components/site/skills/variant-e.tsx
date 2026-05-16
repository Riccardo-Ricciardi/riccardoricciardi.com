import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

type TierId = "core" | "proficient" | "familiar";

const TIER_META: Record<
  TierId,
  { it: string; en: string; cadenceIt: string; cadenceEn: string }
> = {
  core: {
    it: "Core",
    en: "Core",
    cadenceIt: "Ogni giorno",
    cadenceEn: "Every day",
  },
  proficient: {
    it: "Pratico",
    en: "Proficient",
    cadenceIt: "Regolare",
    cadenceEn: "Regular",
  },
  familiar: {
    it: "Familiare",
    en: "Familiar",
    cadenceIt: "Occasionale",
    cadenceEn: "Occasional",
  },
};

function tierFor(percentage: number): TierId {
  if (percentage >= 85) return "core";
  if (percentage >= 60) return "proficient";
  return "familiar";
}

export function SkillsVariantE({ skills, locale = "it" }: VariantProps) {
  const lang = locale === "it" ? "it" : "en";
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  const colIndex = lang === "it" ? "N." : "No.";
  const colName = lang === "it" ? "Strumento" : "Tool";
  const colTier = lang === "it" ? "Livello" : "Tier";
  const colCadence = lang === "it" ? "Cadenza" : "Cadence";
  const colMeter = "%";

  return (
    <div className="overflow-hidden border-y border-border">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {colIndex}
            </th>
            <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {colName}
            </th>
            <th className="hidden py-3 pr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:table-cell">
              {colTier}
            </th>
            <th className="hidden py-3 pr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:table-cell">
              {colCadence}
            </th>
            <th className="w-[35%] py-3 text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {colMeter}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((skill, i) => {
            const tier = tierFor(skill.percentage);
            const cadence =
              lang === "it"
                ? TIER_META[tier].cadenceIt
                : TIER_META[tier].cadenceEn;
            return (
              <tr
                key={skill.id}
                className="group border-b border-border/60 transition-colors duration-150 ease-out last:border-b-0 hover:bg-muted/40"
              >
                <td className="py-4 pr-4 align-middle font-mono text-xs tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="py-4 pr-4 align-middle">
                  <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {skill.name}
                  </span>
                </td>
                <td className="hidden py-4 pr-4 align-middle sm:table-cell">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {TIER_META[tier][lang]}
                  </span>
                </td>
                <td className="hidden py-4 pr-4 align-middle text-sm text-muted-foreground md:table-cell">
                  {cadence}
                </td>
                <td className="py-4 align-middle">
                  <span className="flex items-center justify-end gap-3">
                    <span
                      aria-hidden="true"
                      className="hidden h-px max-w-[120px] flex-1 bg-foreground transition-all duration-200 ease-out sm:block"
                      style={{
                        width: `${skill.percentage}%`,
                        opacity: 0.3 + (skill.percentage / 100) * 0.7,
                      }}
                    />
                    <span className="w-10 text-right font-mono text-xs tabular-nums text-foreground">
                      {skill.percentage}
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

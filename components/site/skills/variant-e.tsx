import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

export function SkillsVariantE({ skills, locale = "it" }: VariantProps) {
  const lang = locale === "it" ? "it" : "en";
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  const colIndex = lang === "it" ? "N." : "No.";
  const colName = lang === "it" ? "Strumento" : "Tool";
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
            <th className="w-[45%] py-3 text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {colMeter}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((skill, i) => (
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
              <td className="py-4 align-middle">
                <span className="flex items-center justify-end gap-3">
                  <span
                    aria-hidden="true"
                    className="hidden h-px max-w-[160px] flex-1 bg-foreground transition-all duration-200 ease-out sm:block"
                    style={{
                      width: `${skill.percentage}%`,
                      opacity: 0.3 + (skill.percentage / 100) * 0.7,
                    }}
                  />
                  <span className="w-12 text-right font-mono text-xs tabular-nums text-foreground">
                    {skill.percentage}%
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

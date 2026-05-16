import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

function tileClass(rank: number): string {
  if (rank === 0) {
    return [
      "col-span-2 row-span-2",
      "sm:col-span-4 sm:row-span-3",
      "md:col-span-4 md:row-span-3 md:[grid-column:2/span_4] md:[grid-row:2/span_3]",
    ].join(" ");
  }
  if (rank < 3) {
    return "col-span-1 row-span-2 sm:col-span-2 sm:row-span-2";
  }
  if (rank < 7) {
    return "col-span-1 row-span-1 sm:col-span-2 sm:row-span-1 md:col-span-2 md:row-span-1";
  }
  return "col-span-1 row-span-1";
}

function nameClass(rank: number): string {
  if (rank === 0) return "text-2xl sm:text-4xl md:text-5xl font-bold";
  if (rank < 3) return "text-lg md:text-xl font-semibold";
  if (rank < 7) return "text-sm md:text-base font-medium";
  return "text-sm font-medium";
}

function pctClass(rank: number): string {
  if (rank === 0) return "text-base md:text-2xl";
  if (rank < 3) return "text-sm md:text-base";
  return "text-xs";
}

export function SkillsVariantM({ skills }: VariantProps) {
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul className="grid list-none grid-flow-dense auto-rows-[88px] grid-cols-2 gap-2 p-0 sm:grid-cols-4 md:auto-rows-[96px] md:grid-cols-6">
      {sorted.map((skill, i) => (
        <li
          key={skill.id}
          className={`group card-base card-interactive flex flex-col justify-between gap-2 overflow-hidden p-4 transition-colors duration-150 ease-out ${tileClass(i)}`}
        >
          <span
            className={`truncate tracking-tight text-foreground ${nameClass(i)}`}
          >
            {skill.name}
          </span>
          <span
            className={`self-end font-mono tabular-nums text-muted-foreground ${pctClass(i)}`}
          >
            {skill.percentage}%
          </span>
        </li>
      ))}
    </ul>
  );
}

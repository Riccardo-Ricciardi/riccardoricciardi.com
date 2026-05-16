import type { Skill } from "@/utils/skills/fetch";

interface VariantProps {
  skills: Skill[];
  locale?: string;
}

function chunk<T>(arr: T[], n: number): T[][] {
  if (n <= 0) return [arr];
  const out: T[][] = [];
  const size = Math.ceil(arr.length / n);
  for (let i = 0; i < n; i++) {
    out.push(arr.slice(i * size, (i + 1) * size));
  }
  return out.filter((c) => c.length > 0);
}

export function SkillsVariantH({ skills }: VariantProps) {
  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);
  const rows = chunk(sorted, 3);

  return (
    <div
      className="relative flex flex-col gap-2 overflow-hidden border-y border-border py-6"
      aria-hidden="false"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"
      />
      {rows.map((row, rowIdx) => {
        const doubled = [...row, ...row];
        const duration = 30 + rowIdx * 12;
        const reverse = rowIdx % 2 === 1;
        return (
          <div
            key={rowIdx}
            className="group relative flex overflow-hidden whitespace-nowrap"
          >
            <ul
              className="flex shrink-0 list-none items-center gap-6 p-0 pr-6 [animation:marquee_var(--dur)_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:!animate-none"
              style={{
                animationDirection: reverse ? "reverse" : "normal",
                ["--dur" as string]: `${duration}s`,
              }}
            >
              {doubled.map((skill, i) => (
                <li
                  key={`${skill.id}-${i}`}
                  className="inline-flex items-baseline gap-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl"
                >
                  <span>{skill.name}</span>
                  <span className="font-mono text-[0.55em] tabular-nums text-muted-foreground">
                    {skill.percentage}%
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-4 inline-block h-1 w-1 rounded-full bg-border align-middle"
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

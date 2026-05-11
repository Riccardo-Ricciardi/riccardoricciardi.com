import { ArrowUpRight } from "lucide-react";
import type { WorkExperience } from "@/utils/work/fetch";

interface WorkTimelineProps {
  items: WorkExperience[];
  locale: string;
  currentLabel: string;
  presentLabel: string;
}

function formatMonth(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "it" ? "it-IT" : "en-US", {
    year: "numeric",
    month: "short",
  });
}

export function WorkTimeline({
  items,
  locale,
  currentLabel,
  presentLabel,
}: WorkTimelineProps) {
  if (items.length === 0) return null;
  return (
    <ol className="relative list-none p-0">
      <span
        aria-hidden="true"
        className="absolute left-[7px] top-2 bottom-2 w-px bg-[image:repeating-linear-gradient(to_bottom,var(--border-dashed)_0_4px,transparent_4px_8px)]"
      />
      {items.map((item) => (
        <li key={item.id} className="relative pl-8 pb-10 last:pb-0">
          <span
            aria-hidden="true"
            className={`absolute left-0 top-2 grid h-[15px] w-[15px] place-items-center rounded-full border-2 ${
              item.is_current ? "border-accent-blue bg-accent-blue-soft" : "border-dashed-soft bg-background"
            }`}
          >
            {item.is_current && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />
            )}
          </span>

          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold tracking-tight md:text-xl">
                {item.role}
                <span className="text-muted-foreground"> · </span>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 hover:text-accent-blue"
                  >
                    {item.company}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <span>{item.company}</span>
                )}
              </h3>
              {item.location && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.location}
                </p>
              )}
            </div>
            <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {formatMonth(item.started_at, locale)}
              {" — "}
              {item.is_current
                ? currentLabel
                : item.ended_at
                  ? formatMonth(item.ended_at, locale)
                  : presentLabel}
            </p>
          </header>

          {item.summary && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/85 md:text-base">
              {item.summary}
            </p>
          )}

          {item.bullets.length > 0 && (
            <ul className="mt-3 list-none space-y-1.5 p-0 text-sm text-muted-foreground">
              {item.bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

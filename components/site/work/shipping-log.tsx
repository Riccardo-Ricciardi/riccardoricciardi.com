import { cn } from "@/utils/cn";
import { getShippingLog, type ShippingLogEntry } from "@/utils/shipping/fetch";
import type { SupportedLanguage } from "@/utils/config/app";
import { LogEntry } from "@/components/site/atoms/log-entry";
import { Reveal } from "@/components/site/atoms/reveal";

interface ShippingLogProps {
  locale: SupportedLanguage;
  heading: string;
}

interface YearGroup {
  year: string;
  entries: ShippingLogEntry[];
}

function groupByYear(entries: ShippingLogEntry[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (const entry of entries) {
    const year = entry.happenedOn.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last && last.year === year) {
      groups[groups.length - 1] = {
        year,
        entries: [...last.entries, entry],
      };
    } else {
      groups.push({ year, entries: [entry] });
    }
  }
  return groups;
}

export async function ShippingLog({ locale, heading }: ShippingLogProps) {
  const entries = await getShippingLog(locale);
  if (entries.length === 0) return null;

  const groups = groupByYear(entries);

  return (
    <section
      aria-labelledby="shipping-log-heading"
      className="container-page section-divider-b section-y"
    >
      <div className="content-narrow flex flex-col gap-8">
        <h2 id="shipping-log-heading" className="text-h2 text-balance">
          {heading}
        </h2>
        <Reveal>
          {groups.map((group, index) => (
            <ul
              key={group.year}
              className={cn(
                "flex list-none flex-col p-0",
                index > 0 && "mt-4 border-t border-border-subtle pt-4"
              )}
            >
              {group.entries.map((entry) => (
                <LogEntry key={entry.id} date={entry.happenedOn.slice(0, 7)}>
                  {entry.body}
                </LogEntry>
              ))}
            </ul>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function ShippingLogSkeleton() {
  return (
    <section className="container-page section-divider-b section-y">
      <div className="content-narrow flex flex-col gap-8">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-baseline gap-4">
              <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

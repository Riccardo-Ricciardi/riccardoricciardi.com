import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Heading } from "@/components/site/atoms/heading";
import { Reveal } from "@/components/site/atoms/reveal";

export interface SurfaceEntry {
  id: string;
  label: string;
  line: string;
  href?: string;
  tinted?: boolean;
}

interface SurfacesProps {
  heading: string;
  intro: string;
  entries: SurfaceEntry[];
}

const CELL_SPANS = [
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
];

export function Surfaces({ heading, intro, entries }: SurfacesProps) {
  return (
    <section className="section-divider-b">
      <div className="container-page section-y flex flex-col gap-10">
        <Heading level="h2" title={heading} subtitle={intro} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {entries.map((entry, index) => {
            const body = (
              <>
                <p className="text-telemetry uppercase tracking-[0.08em] text-foreground">
                  {entry.label}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {entry.line}
                </p>
                {entry.href && (
                  <ArrowUpRight
                    className="mt-auto size-4 text-fg-subtle transition-colors duration-150 group-hover:text-accent-blue"
                    aria-hidden="true"
                  />
                )}
              </>
            );
            return (
              <Reveal
                as="li"
                key={entry.id}
                delayMs={index * 50}
                className={cn("min-h-36", CELL_SPANS[index])}
              >
                {entry.href ? (
                  <Link
                    href={entry.href}
                    className={cn(
                      "card-base card-interactive group flex h-full flex-col gap-2 no-underline",
                      entry.tinted && "bg-live-soft"
                    )}
                  >
                    {body}
                  </Link>
                ) : (
                  <div
                    className={cn(
                      "card-base flex h-full flex-col gap-2",
                      entry.tinted && "bg-live-soft"
                    )}
                  >
                    {body}
                  </div>
                )}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

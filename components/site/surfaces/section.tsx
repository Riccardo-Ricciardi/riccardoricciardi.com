import Link from "next/link";
import {
  ArrowUpRight,
  CircuitBoard,
  Cpu,
  Globe,
  Monitor,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
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
  eyebrow: string;
  heading: string;
  intro: string;
  entries: SurfaceEntry[];
}

const CELL_SPANS = [
  "lg:col-span-4 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
];

const LEAD_GRADIENT =
  "radial-gradient(120% 80% at 100% 0%, var(--glow-soft), transparent 60%)";

const SURFACE_ICONS: Record<string, LucideIcon> = {
  "windows-desktop": Monitor,
  "raspberry-pi": Cpu,
  web: Globe,
  ios: Smartphone,
  "embedded-esp32": CircuitBoard,
};

export function Surfaces({ eyebrow, heading, intro, entries }: SurfacesProps) {
  return (
    <section className="section-divider-b">
      <div className="container-page section-y flex flex-col gap-10">
        <Reveal variant="fade-up">
          <Heading level="h2" eyebrow={eyebrow} title={heading} subtitle={intro} />
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {entries.map((entry, index) => {
            const Icon = SURFACE_ICONS[entry.id];
            const isLead = index === 0;
            const body = (
              <>
                <div className="flex items-center gap-2.5">
                  {Icon && (
                    <Icon
                      className={cn(
                        "shrink-0 transition-colors duration-150",
                        isLead
                          ? "size-7 text-signal"
                          : "size-5 text-fg-subtle group-hover:text-foreground"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <p className="text-telemetry uppercase tracking-[0.08em] text-foreground">
                    {entry.label}
                  </p>
                </div>
                <p
                  className={cn(
                    "text-muted-foreground",
                    isLead ? "text-body max-w-md" : "text-body-sm"
                  )}
                >
                  {entry.line}
                </p>
                {entry.href && (
                  <ArrowUpRight
                    className="mt-auto size-4 text-fg-subtle transition duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    aria-hidden="true"
                  />
                )}
              </>
            );
            const cardClass = cn(
              "card-base group flex h-full flex-col gap-2",
              isLead && "card-pad-lg gap-3 border-accent-blue",
              entry.href && "card-interactive no-underline"
            );
            const cardStyle = isLead
              ? { backgroundImage: LEAD_GRADIENT }
              : undefined;
            return (
              <Reveal
                as="li"
                key={entry.id}
                variant="rise"
                delayMs={Math.min(index * 70, 280)}
                className={cn(isLead ? "min-h-[17rem]" : "min-h-36", CELL_SPANS[index])}
              >
                {entry.href ? (
                  <Link href={entry.href} className={cardClass} style={cardStyle}>
                    {body}
                  </Link>
                ) : (
                  <div className={cardClass} style={cardStyle}>
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

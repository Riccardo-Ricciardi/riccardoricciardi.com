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
import { DrawOnView } from "@/components/site/fx/draw-on-view";
import { Parallax } from "@/components/site/fx/parallax";
import type { SurfaceEntry } from "@/components/site/surfaces/section";

interface BentoProps {
  eyebrow: string;
  heading: string;
  intro: string;
  entries: SurfaceEntry[];
}

const ICONS: Record<string, LucideIcon> = {
  "windows-desktop": Monitor,
  "raspberry-pi": Cpu,
  "embedded-esp32": CircuitBoard,
  web: Globe,
  ios: Smartphone,
};

// F24 (the flagship) takes the big cell, first.
const PLACEMENT: Record<string, string> = {
  "windows-desktop": "lg:col-span-2 lg:row-span-2",
  web: "lg:col-start-3 lg:row-start-1",
  "embedded-esp32": "lg:col-start-3 lg:row-start-2",
};

const CARD_BASE =
  "card-base group relative flex h-full flex-col overflow-hidden transition-colors hover:border-accent-blue no-underline";

function CardHeader({ entry }: { entry: SurfaceEntry }) {
  const Icon = ICONS[entry.id];
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="size-5 text-signal" aria-hidden="true" />}
        <p className="text-telemetry uppercase tracking-[0.08em] text-foreground">
          {entry.label}
        </p>
      </div>
      {entry.href && (
        <ArrowUpRight
          className="size-4 text-fg-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function Shell({ entry, children }: { entry: SurfaceEntry; children: React.ReactNode }) {
  return entry.href ? (
    <Link href={entry.href} className={CARD_BASE}>
      {children}
    </Link>
  ) : (
    <div className={CARD_BASE}>{children}</div>
  );
}

/* ── Windows: a desktop app window whose grid fills (F24 → Excel) on hover ── */

function WindowsCard({ entry }: { entry: SurfaceEntry }) {
  const Icon = ICONS[entry.id];
  return (
    <Link href={entry.href ?? "#"} className={cn(CARD_BASE, "min-h-[20rem]")}>
      <CardHeader entry={entry} />
      <p className="mt-3 max-w-md text-body text-muted-foreground">{entry.line}</p>

      <div className="mt-auto w-full" aria-hidden="true">
        <div className="overflow-hidden rounded-lg border border-border bg-[var(--background)] transition-colors group-hover:border-accent-blue">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            {Icon && (
              <Icon className="size-4 text-fg-subtle transition-colors group-hover:text-signal" />
            )}
            <span className="font-mono text-[0.78rem] text-muted-foreground">
              {entry.label}
            </span>
            <span className="ml-auto flex items-center gap-3 font-mono text-[0.8rem] leading-none text-fg-subtle transition-colors group-hover:text-signal">
              <span>—</span>
              <span>▢</span>
              <span>✕</span>
            </span>
          </div>
          <div className="grid grid-cols-8 gap-px bg-border">
            {Array.from({ length: 40 }).map((_, i) => {
              const col = i % 8;
              const row = Math.floor(i / 8);
              return (
                <div
                  key={i}
                  className="h-10 bg-[var(--bg-elevated)] transition-colors duration-300 group-hover:bg-[var(--accent-blue-soft)]"
                  style={{ transitionDelay: `${(col + row) * 40}ms` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Web: a 2D wireframe globe — parallels static, meridians spin ──── */

function GlobeCard({ entry }: { entry: SurfaceEntry }) {
  return (
    <Shell entry={entry}>
      <CardHeader entry={entry} />
      <p className="mt-2 line-clamp-2 text-body-sm text-muted-foreground">
        {entry.line}
      </p>
      <DrawOnView className="relative mt-auto flex items-center justify-center pt-2">
        <svg viewBox="0 0 200 200" className="h-32 w-32" aria-hidden="true">
          <g strokeWidth={1.25} vectorEffect="non-scaling-stroke" data-draw>
            <circle cx={100} cy={100} r={76} pathLength={1} className="globe-line" />
            <ellipse cx={100} cy={64} rx={58} ry={8} pathLength={1} className="globe-line" />
            <ellipse cx={100} cy={100} rx={76} ry={12} pathLength={1} className="globe-line" />
            <ellipse cx={100} cy={136} rx={58} ry={8} pathLength={1} className="globe-line" />
            {[0, -2.3, -4.6].map((delay, i) => (
              <ellipse
                key={i}
                cx={100}
                cy={100}
                rx={76}
                ry={76}
                pathLength={1}
                className="globe-line globe-meridian"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </g>
          {[
            [140, 72, 0],
            [70, 120, -1],
            [120, 152, -2],
          ].map(([cx, cy, delay], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={2.6}
              className="globe-node"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </svg>
      </DrawOnView>
    </Shell>
  );
}

/* ── Embedded: PCB traces that light + carry a current flow on hover ── */

const PCB_LINES = [
  "M0 40 H72 V88 H148",
  "M0 120 H56 V172 H132",
  "M200 24 H148 V72 H112",
  "M200 150 H160 V120 H120",
  "M96 0 V40 H60",
  "M120 200 V150 H164",
  "M40 88 V128 H96",
  "M16 168 H72",
];

const PCB_PADS = [
  [148, 88],
  [132, 172],
  [112, 72],
  [120, 120],
  [60, 40],
  [164, 150],
  [96, 128],
  [72, 168],
];

function PcbCard({ entry }: { entry: SurfaceEntry }) {
  return (
    <Shell entry={entry}>
      <DrawOnView className="pointer-events-none absolute inset-0">
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {PCB_LINES.map((d, i) => (
          <path
            key={`l-${i}`}
            d={d}
            fill="none"
            strokeWidth={1.25}
            pathLength={1}
            data-draw
            vectorEffect="non-scaling-stroke"
            className="pcb-line"
            style={{ transitionDelay: `${i * 55}ms` }}
          />
        ))}
        {PCB_LINES.map((d, i) => (
          <path
            key={`f-${i}`}
            d={d}
            fill="none"
            strokeWidth={1.75}
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            className="pcb-flow"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
        {PCB_PADS.map(([x, y], i) => (
          <rect
            key={`p-${i}`}
            x={x - 3}
            y={y - 3}
            width={6}
            height={6}
            rx={1}
            className="pcb-pad"
            style={{ transitionDelay: `${i * 55 + 140}ms` }}
          />
        ))}
      </svg>
      </DrawOnView>
      <div className="relative">
        <CardHeader entry={entry} />
        <p className="mt-2 line-clamp-2 text-body-sm text-muted-foreground">
          {entry.line}
        </p>
      </div>
    </Shell>
  );
}

function InfoCard({ entry }: { entry: SurfaceEntry }) {
  return (
    <Shell entry={entry}>
      <CardHeader entry={entry} />
      <p className="mt-2 text-body-sm text-muted-foreground">{entry.line}</p>
    </Shell>
  );
}

function CardFor({ entry }: { entry: SurfaceEntry }) {
  if (entry.id === "windows-desktop") return <WindowsCard entry={entry} />;
  if (entry.id === "web") return <GlobeCard entry={entry} />;
  if (entry.id === "embedded-esp32") return <PcbCard entry={entry} />;
  return <InfoCard entry={entry} />;
}

export function SurfacesBento({ eyebrow, heading, intro, entries }: BentoProps) {
  return (
    <section className="section-divider-b">
      <div className="container-page section-y flex flex-col gap-12">
        <Parallax speed={0.04}>
          <Reveal variant="fade-up">
            <Heading level="h2" eyebrow={eyebrow} title={heading} subtitle={intro} />
          </Reveal>
        </Parallax>
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {entries.map((entry, i) => (
            <Reveal
              key={entry.id}
              variant="scale"
              delayMs={i * 90}
              className={cn("h-full min-w-0", PLACEMENT[entry.id])}
            >
              <CardFor entry={entry} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

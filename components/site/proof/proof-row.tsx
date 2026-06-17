import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Project } from "@/utils/projects/fetch";
import { telemetryParts } from "@/utils/projects/telemetry";
import type { SupportedLanguage } from "@/utils/config/app";
import { TelemetryLine } from "@/components/site/atoms/telemetry-line";
import { AnimatedMetricChip } from "@/components/site/atoms/animated-metric-chip";
import { CountUp } from "@/components/site/atoms/count-up";
import { Reveal } from "@/components/site/atoms/reveal";
import { Parallax } from "@/components/site/fx/parallax";

interface ProofRowProps {
  project: Project;
  locale: SupportedLanguage;
  linkLabel: string;
  layout: "lead" | "mirror" | "banner";
}

const SPARK = [5, 7, 6, 9, 8, 10, 9, 11, 10, 12, 11, 13, 12, 14, 13, 15];
const LEADING_NUMBER = /^(\d{1,6})(.*)$/;

function MetricRow({ metric }: { metric: string }) {
  const m = LEADING_NUMBER.exec(metric);
  return (
    <li className="text-telemetry flex items-center gap-2 py-1.5">
      <span aria-hidden="true" className="text-fg-subtle">
        ▸
      </span>
      {m ? (
        <span className="whitespace-pre">
          <CountUp value={parseInt(m[1], 10)} className="text-signal tabular-nums" />
          {m[2]}
        </span>
      ) : (
        <span>{metric}</span>
      )}
    </li>
  );
}

function SystemPanel({
  project,
  stateLabel,
}: {
  project: Project;
  stateLabel: string;
}) {
  const metrics = project.metrics.slice(0, 4);
  return (
    <div className="card-base card-flush overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent-blue" />
          <span className="text-telemetry truncate">{project.slug}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {stateLabel ? (
            <span className="text-telemetry text-signal">{stateLabel}</span>
          ) : (
            project.surface && (
              <span className="text-telemetry text-fg-subtle">{project.surface}</span>
            )
          )}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="flex h-9 items-end gap-0.5 border-b border-border px-4 py-2"
      >
        {SPARK.map((h, i) => (
          <span
            key={i}
            style={{ height: `${(h / 15) * 100}%` }}
            className={cn(
              "flex-1 rounded-[1px]",
              i >= SPARK.length - 2 ? "bg-accent-blue" : "bg-muted-foreground/35"
            )}
          />
        ))}
      </div>

      <ul className="flex flex-col px-4 py-3">
        {metrics.map((metric) => (
          <MetricRow key={metric} metric={metric} />
        ))}
      </ul>

      <div className="text-telemetry flex items-center gap-2 border-t border-border px-4 py-2.5">
        <span className="text-signal">$</span>
        <span className="text-foreground">deploy --prod</span>
        <span className="ml-auto text-fg-subtle">· live</span>
      </div>
    </div>
  );
}

export function ProofRow({ project, locale, linkLabel, layout }: ProofRowProps) {
  const { stateLabel, segments } = telemetryParts(project);
  const href = `/${locale}/work#${project.slug ?? project.id}`;
  const image = project.screenshot_url ?? project.og_image;

  if (layout === "banner") {
    return (
      <Reveal>
        <Link
          href={href}
          className="card-base card-interactive group flex flex-col gap-3 no-underline"
        >
          <TelemetryLine stateLabel={stateLabel} segments={segments} />
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-h3 text-foreground">{project.name}</h3>
            <span className="text-body-sm flex items-center gap-1 text-signal">
              <span className="link-underline">{linkLabel}</span>
              <ArrowRight
                className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
          <p className="text-body max-w-3xl text-muted-foreground">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.metrics.slice(0, 3).map((metric) => (
              <AnimatedMetricChip key={metric}>{metric}</AnimatedMetricChip>
            ))}
          </div>
        </Link>
      </Reveal>
    );
  }

  const mirrored = layout === "mirror";

  return (
    <Reveal>
      <Link
        href={href}
        className={cn(
          "group grid items-center gap-8 no-underline lg:grid-cols-[5fr_4fr]",
          mirrored && "lg:grid-cols-[4fr_5fr]"
        )}
      >
        <div
          className={cn(
            "flex flex-col items-start gap-4",
            mirrored && "lg:order-2"
          )}
        >
          <TelemetryLine stateLabel={stateLabel} segments={segments.slice(0, 1)} />
          <h3 className="text-h3 text-foreground">{project.name}</h3>
          <p className="text-body-lg text-muted-foreground">
            {project.description}
          </p>
          {project.outcome && (
            <p className="text-body-sm max-w-prose text-muted-foreground">
              {project.outcome}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {project.metrics.map((metric) => (
              <AnimatedMetricChip key={metric}>{metric}</AnimatedMetricChip>
            ))}
          </div>
          <span className="text-body-sm flex items-center gap-1 text-signal">
            <span className="link-underline">{linkLabel}</span>
            <ArrowRight
              className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>

        <Parallax speed={0.05} className={cn(mirrored && "lg:order-1")}>
          {image ? (
            <div className="card-base card-flush overflow-hidden">
              <Image
                src={image}
                alt={project.name || project.slug || "Project screenshot"}
                width={1280}
                height={800}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 640px"
                className="aspect-[16/10] w-full object-cover object-top"
              />
            </div>
          ) : (
            <SystemPanel project={project} stateLabel={stateLabel} />
          )}
        </Parallax>
      </Link>
    </Reveal>
  );
}

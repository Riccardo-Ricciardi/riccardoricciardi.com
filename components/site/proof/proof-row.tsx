import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Project } from "@/utils/projects/fetch";
import { telemetryParts } from "@/utils/projects/telemetry";
import type { SupportedLanguage } from "@/utils/config/app";
import { TelemetryLine } from "@/components/site/atoms/telemetry-line";
import { MetricChip } from "@/components/site/atoms/metric-chip";
import { StatusDot } from "@/components/site/atoms/status-dot";
import { Reveal } from "@/components/site/atoms/reveal";

interface ProofRowProps {
  project: Project;
  locale: SupportedLanguage;
  linkLabel: string;
  layout: "lead" | "mirror" | "banner";
}

function SystemPanel({ project }: { project: Project }) {
  return (
    <div className="card-base card-flush overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2.5">
        <span className="text-telemetry">{project.slug}</span>
        <StatusDot state={project.status ?? "shipped"} />
      </div>
      <ul className="flex flex-col px-4 py-3">
        {project.metrics.map((metric) => (
          <li
            key={metric}
            className="text-telemetry flex items-center gap-2 py-1.5"
          >
            <span aria-hidden="true" className="text-fg-subtle">
              ▸
            </span>
            {metric}
          </li>
        ))}
        {project.surface && (
          <li className="text-telemetry flex items-center gap-2 border-t border-border-subtle py-1.5 pt-2.5">
            <span aria-hidden="true" className="text-fg-subtle">
              ▸
            </span>
            surface: {project.surface}
          </li>
        )}
      </ul>
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
          <TelemetryLine state={project.status ?? "shipped"} stateLabel={stateLabel} segments={segments} />
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-h3 text-foreground">{project.name}</h3>
            <span className="text-body-sm flex items-center gap-1 text-accent-blue">
              {linkLabel}
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
              <MetricChip key={metric}>{metric}</MetricChip>
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
          <TelemetryLine state={project.status ?? "shipped"} stateLabel={stateLabel} segments={segments} />
          <h3 className="text-h2 text-foreground">{project.name}</h3>
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
              <MetricChip key={metric}>{metric}</MetricChip>
            ))}
          </div>
          <span className="text-body-sm flex items-center gap-1 text-accent-blue">
            {linkLabel}
            <ArrowRight
              className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>

        <div className={cn(mirrored && "lg:order-1")}>
          {image ? (
            <div className="card-base card-flush overflow-hidden">
              <Image
                src={image}
                alt={`${project.name} screenshot`}
                width={1280}
                height={800}
                className="aspect-[16/10] w-full object-cover object-top"
              />
            </div>
          ) : (
            <SystemPanel project={project} />
          )}
        </div>
      </Link>
    </Reveal>
  );
}

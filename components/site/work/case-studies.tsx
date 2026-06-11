import Image from "next/image";
import type { Project } from "@/utils/projects/fetch";
import { getCaseStudies } from "@/utils/projects/fetch";
import { telemetryParts } from "@/utils/projects/telemetry";
import type { SupportedLanguage } from "@/utils/config/app";
import { TelemetryLine } from "@/components/site/atoms/telemetry-line";
import { MetricChip } from "@/components/site/atoms/metric-chip";
import { Reveal } from "@/components/site/atoms/reveal";

export interface CaseStudyLabels {
  problem: string;
  solution: string;
  outcome: string;
}

interface CaseStudiesProps {
  locale: SupportedLanguage;
  labels: CaseStudyLabels;
}

function ProseBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-eyebrow">{label}</h3>
      <p className="text-body max-w-prose leading-relaxed text-foreground/85">
        {body}
      </p>
    </div>
  );
}

function CaseStudyArticle({
  project,
  labels,
}: {
  project: Project;
  labels: CaseStudyLabels;
}) {
  const { stateLabel, segments } = telemetryParts(project);
  const image = project.screenshot_url ?? project.og_image;

  return (
    <Reveal>
      <article
        id={project.slug ?? project.id}
        className="flex scroll-mt-20 flex-col gap-6"
      >
        <TelemetryLine
          state={project.status ?? "shipped"}
          stateLabel={stateLabel}
          segments={segments}
        />
        <h2 className="text-h2 text-balance text-foreground">{project.name}</h2>
        {project.description && (
          <p className="text-body-lg max-w-prose text-muted-foreground">
            {project.description}
          </p>
        )}
        {image && (
          <div className="card-base card-flush overflow-hidden">
            <Image
              src={image}
              alt={`${project.name} screenshot`}
              width={1280}
              height={800}
              className="aspect-[16/10] w-full object-cover object-top"
            />
          </div>
        )}
        {project.problem && (
          <ProseBlock label={labels.problem} body={project.problem} />
        )}
        {project.solution && (
          <ProseBlock label={labels.solution} body={project.solution} />
        )}
        {project.outcome && (
          <ProseBlock label={labels.outcome} body={project.outcome} />
        )}
        {project.metrics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.metrics.map((metric) => (
              <MetricChip key={metric}>{metric}</MetricChip>
            ))}
          </div>
        )}
      </article>
    </Reveal>
  );
}

export async function CaseStudies({ locale, labels }: CaseStudiesProps) {
  const studies = await getCaseStudies(locale);
  if (studies.length === 0) return null;

  return (
    <section className="container-page section-divider-b section-y">
      <div className="content-narrow flex flex-col gap-20">
        {studies.map((project) => (
          <CaseStudyArticle
            key={project.id}
            project={project}
            labels={labels}
          />
        ))}
      </div>
    </section>
  );
}

export function CaseStudiesSkeleton() {
  return (
    <section className="container-page section-divider-b section-y">
      <div className="content-narrow flex flex-col gap-20">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-6">
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full max-w-prose animate-pulse rounded bg-muted" />
            <div className="aspect-[16/10] w-full animate-pulse rounded bg-muted" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-28 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

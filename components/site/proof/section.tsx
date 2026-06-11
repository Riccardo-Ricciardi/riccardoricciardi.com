import { getCaseStudies } from "@/utils/projects/fetch";
import type { SupportedLanguage } from "@/utils/config/app";
import { Heading } from "@/components/site/atoms/heading";
import { ProofRow } from "@/components/site/proof/proof-row";

interface ProofProps {
  locale: SupportedLanguage;
  heading: string;
  linkLabel: string;
}

export async function Proof({ locale, heading, linkLabel }: ProofProps) {
  const studies = await getCaseStudies(locale);
  const featured = studies.filter((p) => p.featured);
  if (featured.length === 0) return null;

  return (
    <section id="proof" className="section-divider-b">
      <div className="container-page section-y flex flex-col gap-12">
        <Heading level="h2" title={heading} />
        <div className="flex flex-col gap-12">
          {featured.map((project, index) => (
            <ProofRow
              key={project.id}
              project={project}
              locale={locale}
              linkLabel={linkLabel}
              layout={index === 0 ? "lead" : index === 1 ? "mirror" : "banner"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

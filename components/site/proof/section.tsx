import { getCaseStudies } from "@/utils/projects/fetch";
import type { SupportedLanguage } from "@/utils/config/app";
import { Heading } from "@/components/site/atoms/heading";
import { Reveal } from "@/components/site/atoms/reveal";
import { ProofRow } from "@/components/site/proof/proof-row";

interface ProofProps {
  locale: SupportedLanguage;
  eyebrow: string;
  heading: string;
  linkLabel: string;
}

export async function Proof({ locale, eyebrow, heading, linkLabel }: ProofProps) {
  const studies = await getCaseStudies(locale);
  const featured = studies.filter((p) => p.featured);
  if (featured.length === 0) return null;

  return (
    <section id="proof" className="section-divider-b">
      <div className="container-page section-y flex flex-col gap-12">
        <Reveal variant="fade-up">
          <Heading level="h2" eyebrow={eyebrow} title={heading} />
        </Reveal>
        <div className="flex flex-col gap-12">
          {featured.map((project, index) => (
            <Reveal key={project.id} variant="fade-up" delayMs={index * 120}>
              <ProofRow
                project={project}
                locale={locale}
                linkLabel={linkLabel}
                layout={index === 0 ? "lead" : index === 1 ? "mirror" : "banner"}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

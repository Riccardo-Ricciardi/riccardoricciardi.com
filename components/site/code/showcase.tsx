import { Heading } from "@/components/site/atoms/heading";
import { Reveal } from "@/components/site/atoms/reveal";

interface CodeShowcaseProps {
  eyebrow: string;
  heading: string;
  intro: string;
  principles: string[];
}

export function CodeShowcase({
  eyebrow,
  heading,
  intro,
  principles,
}: CodeShowcaseProps) {
  return (
    <section className="section-divider-b">
      <div className="container-page section-y grid items-start gap-x-12 gap-y-10 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal variant="fade-up">
          <Heading level="h2" eyebrow={eyebrow} title={heading} subtitle={intro} />
        </Reveal>

        <Reveal variant="fade-up">
          <ol className="flex flex-col">
            {principles.map((principle, i) => (
              <li
                key={i}
                className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 border-t border-border py-5 last:border-b"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-sm tabular-nums text-signal"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-body-lg text-foreground">{principle}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

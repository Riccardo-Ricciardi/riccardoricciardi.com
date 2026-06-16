import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ParticleField } from "@/components/site/fx/particle-field";

interface ClosingCtaProps {
  heading: string;
  sub: string;
  buttonLabel: string;
  href: string;
  email?: string | null;
}

export function ClosingCta({
  heading,
  sub,
  buttonLabel,
  href,
  email,
}: ClosingCtaProps) {
  return (
    <section className="section-divider-t relative overflow-hidden">
      <ParticleField density={3} maxParticles={40} linkDistance={100} />
      <div className="container-page section-y relative">
        <div className="content-narrow flex flex-col items-center gap-5 text-center">
          <h2 className="text-h1 text-balance">{heading}</h2>
          <p className="text-body-lg max-w-2xl text-balance text-muted-foreground">
            {sub}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link href={href} className="btn-base btn-lg btn-primary">
              {buttonLabel}
              <ArrowRight className="btn-arrow ml-1 size-4" aria-hidden="true" />
            </Link>
            {email && (
              <a
                href={`mailto:${email}`}
                className="text-telemetry link-underline transition-colors hover:text-foreground"
              >
                {email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

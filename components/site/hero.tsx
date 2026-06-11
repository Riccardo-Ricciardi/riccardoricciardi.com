import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusDot } from "@/components/site/atoms/status-dot";

interface HeroProps {
  wordmarkLine: string;
  availability: string;
  title: string;
  proofClause: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function Hero({
  wordmarkLine,
  availability,
  title,
  proofClause,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  return (
    <section className="section-divider-b relative">
      <div
        aria-hidden="true"
        className="bg-scan pointer-events-none absolute inset-0 -z-10"
      />

      <div className="container-page section-y">
        <div className="flex max-w-4xl flex-col items-start gap-6">
          <div
            className="enter-fade-up flex w-full flex-wrap items-center justify-between gap-3"
            style={{ "--enter-delay": "0ms" } as React.CSSProperties}
          >
            <p className="text-eyebrow">{wordmarkLine}</p>
            <p className="pill-base text-telemetry">
              <StatusDot state="live" />
              {availability}
            </p>
          </div>

          <h1
            className="text-display enter-fade-up text-balance"
            style={{ "--enter-delay": "60ms" } as React.CSSProperties}
          >
            {title}
          </h1>

          <p
            className="text-body-lg enter-fade-up max-w-2xl text-muted-foreground"
            style={{ "--enter-delay": "120ms" } as React.CSSProperties}
          >
            {proofClause}
          </p>

          <div
            className="enter-fade-up flex flex-wrap items-center gap-3"
            style={{ "--enter-delay": "180ms" } as React.CSSProperties}
          >
            <Link href={primaryCta.href} className="btn-base btn-lg btn-primary">
              {primaryCta.label}
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="btn-base btn-lg btn-ghost"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

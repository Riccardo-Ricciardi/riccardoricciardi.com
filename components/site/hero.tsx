import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroBackdrop } from "@/components/site/fx/hero-backdrop";

interface HeroProps {
  wordmarkLine: string;
  title: string;
  proofClause: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  scrollLabel?: string;
}

export function Hero({
  wordmarkLine,
  title,
  proofClause,
  primaryCta,
  secondaryCta,
  scrollLabel,
}: HeroProps) {
  const words = title.split(" ");
  const lastWordDelay = 60 + Math.max(words.length - 1, 0) * 45;
  const proofDelay = lastWordDelay + 90;
  const ctaDelay = lastWordDelay + 150;
  const cueDelay = ctaDelay + 140;

  return (
    <section className="section-divider-b relative overflow-hidden">
      <HeroBackdrop />

      <div className="container-page relative">
        <div className="flex min-h-[clamp(32rem,80vh,50rem)] flex-col justify-center gap-7 py-16">
          <div
            className="enter-fade-up flex items-center gap-2.5"
            style={{ "--enter-delay": "0ms" } as React.CSSProperties}
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-[1px] bg-accent-blue"
            />
            <p className="text-eyebrow">{wordmarkLine}</p>
          </div>

          <h1 className="text-display text-balance max-w-[16ch]">
            {words.map((word, index) => (
              <span key={`${word}-${index}`}>
                <span
                  className="enter-fade-up inline-block"
                  style={
                    {
                      "--enter-delay": `${60 + index * 45}ms`,
                    } as React.CSSProperties
                  }
                >
                  {word}
                </span>
                {index < words.length - 1 ? " " : null}
              </span>
            ))}
          </h1>

          <p
            className="text-body-lg enter-fade-up max-w-[54ch] text-muted-foreground"
            style={{ "--enter-delay": `${proofDelay}ms` } as React.CSSProperties}
          >
            {proofClause}
          </p>

          <div
            className="enter-fade-up flex flex-wrap items-center gap-3"
            style={{ "--enter-delay": `${ctaDelay}ms` } as React.CSSProperties}
          >
            <Link href={primaryCta.href} className="btn-base btn-lg btn-primary">
              {primaryCta.label}
              <ArrowRight className="btn-arrow ml-1 size-4" aria-hidden="true" />
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

          <div
            className="enter-fade-up mt-8 hidden items-center gap-3 sm:flex"
            style={{ "--enter-delay": `${cueDelay}ms` } as React.CSSProperties}
          >
            <span aria-hidden="true" className="scroll-cue" />
            <span className="text-eyebrow text-fg-subtle">
              {scrollLabel || "scroll"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

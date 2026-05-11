import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MouseParticles } from "@/components/mouse-particles";

interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  locale: string;
}

export function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  locale,
}: HeroProps) {
  return (
    <section className="section-divider-b relative">
      <div
        aria-hidden="true"
        className="bg-dot bg-dot-mask pointer-events-none absolute inset-0 -z-20"
      />
      <div
        aria-hidden="true"
        className="gradient-glow pointer-events-none absolute inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
      >
        <MouseParticles count={55} linkDistance={110} repelRadius={130} />
      </div>

      <div className="container-page section-y">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {eyebrow && (
            <Link
              href={`/${locale}/contact`}
              className="group mb-5 inline-flex items-center gap-2 rounded-pill border border-dashed-soft bg-background/80 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur transition-colors hover:border-accent-blue hover:text-foreground"
            >
              <span
                aria-hidden="true"
                className="relative inline-flex h-1.5 w-1.5"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <Sparkles
                className="h-3 w-3 text-accent-blue"
                aria-hidden="true"
              />
              <span>{eyebrow}</span>
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          )}
          <h1 className="text-display text-balance">
            {title}
          </h1>
          <p className="text-body-lg mt-5 max-w-2xl text-balance text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-accent-blue text-white shadow-sm hover:bg-[var(--accent-blue-hover)]"
            >
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            {secondaryCta && (
              <Button asChild size="lg" variant="outline">
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

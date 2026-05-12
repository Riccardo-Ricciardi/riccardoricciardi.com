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
        <div className="content-narrow flex flex-col items-center text-center">
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
              className="bg-accent-blue text-white hover:bg-[var(--accent-blue-hover)]"
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

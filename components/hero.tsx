import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

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
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="bg-dot bg-dot-mask pointer-events-none absolute inset-0 -z-10"
      />
      <div className="container-page py-20 md:py-28 lg:py-36">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {eyebrow && (
            <Link
              href={`/${locale}`}
              className="group mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent"
            >
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              <span>{eyebrow}</span>
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          )}
          <h1 className="text-balance text-5xl font-semibold tracking-tight leading-[1.05] md:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
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

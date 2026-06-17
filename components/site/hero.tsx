"use client";

import { Fragment, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { LogoMark } from "@/components/site/fx/logo-mark";

interface HeroProps {
  wordmarkLine: string;
  title: string;
  proofClause: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({
  wordmarkLine,
  title,
  proofClause,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const driftY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  const words = title.split(" ");
  const tail = 0.08 + words.length * 0.06;
  const hasSecondary = Boolean(secondaryCta && secondaryCta.label);

  return (
    <section ref={ref} className="section-divider-b relative overflow-hidden">
      <div
        aria-hidden="true"
        className="group pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[42%] items-center justify-end sm:flex"
      >
        <div className="pointer-events-auto flex h-[112%] items-center">
          <LogoMark className="hero-logo-mark h-full w-auto translate-x-[14%]" />
        </div>
      </div>

      <motion.div
        style={reduce ? undefined : { y: driftY }}
        className="container-page relative z-10 flex min-h-[clamp(34rem,90vh,56rem)] flex-col justify-center gap-8 py-20"
      >
        <div className="flex items-center gap-2.5 font-mono">
          <span aria-hidden="true" className="size-1.5 rounded-[1px] bg-accent-blue" />
          <span className="text-eyebrow">{wordmarkLine}</span>
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-px bg-accent-blue"
          />
        </div>

        <h1 className="max-w-[18ch] text-balance text-[clamp(2.75rem,7vw,7rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
          {words.map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              {reduce ? (
                <span className="inline-block">{word}</span>
              ) : (
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, y: "0.45em" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.08 + i * 0.06, ease: EASE }}
                >
                  {word}
                </motion.span>
              )}
              {i < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </h1>

        <motion.p
          className="max-w-[52ch] text-body-lg text-muted-foreground"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: tail + 0.05, ease: EASE }}
        >
          {proofClause}
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center gap-3"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: tail + 0.15, ease: EASE }}
        >
          <Link href={primaryCta.href} className="btn-base btn-lg btn-primary">
            {primaryCta.label}
            <ArrowRight className="btn-arrow ml-1 size-4" aria-hidden="true" />
          </Link>
          {hasSecondary && secondaryCta && (
            <Link href={secondaryCta.href} className="btn-base btn-lg btn-ghost">
              {secondaryCta.label}
            </Link>
          )}
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <ChevronDown
          className="hero-bob size-5 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { CountUp } from "@/components/site/atoms/count-up";

const LEADING_NUMBER = /^(\d{1,6})(.*)$/;
const PERCENT = /^(\d{1,3})%/;

interface AnimatedMetricChipProps {
  children: string;
  className?: string;
}

export function AnimatedMetricChip({
  children,
  className,
}: AnimatedMetricChipProps) {
  const numberMatch = LEADING_NUMBER.exec(children);
  const percentMatch = PERCENT.exec(children);
  const hasMeter = percentMatch !== null;
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!hasMeter) return;
    const node = ref.current;
    if (!node) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMeter]);

  const meterScale = percentMatch
    ? Math.min(parseInt(percentMatch[1], 10), 100) / 100
    : 0;

  return (
    <span
      ref={ref}
      className={cn("chip-metric", hasMeter && "chip-metric-meter", className)}
    >
      {numberMatch ? (
        <span className="whitespace-pre">
          <CountUp value={parseInt(numberMatch[1], 10)} />
          {numberMatch[2]}
        </span>
      ) : (
        children
      )}
      {hasMeter && (
        <span
          aria-hidden="true"
          className="chip-meter-fill"
          style={{ transform: inView ? `scaleX(${meterScale})` : "scaleX(0)" }}
        />
      )}
    </span>
  );
}

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

interface ParallaxProps {
  children: React.ReactNode;
  /** drift as a fraction of the element height across its scroll pass (0.06 = subtle) */
  speed?: number;
  className?: string;
}

/** Subtle scroll-linked vertical drift for depth. Reduced motion: static. */
export function Parallax({ children, speed = 0.06, className }: ParallaxProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const pct = speed * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`${pct}%`, `${-pct}%`]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

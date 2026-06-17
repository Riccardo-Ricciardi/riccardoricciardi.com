"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

type RevealVariant = "fade-up" | "rise" | "scale";

interface RevealProps {
  children: React.ReactNode;
  as?: "div" | "section" | "li" | "span";
  variant?: RevealVariant;
  delayMs?: number;
  className?: string;
}

const VARIANTS: Record<RevealVariant, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  },
  rise: {
    hidden: { opacity: 0, y: 52 },
    show: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92, y: 16 },
    show: { opacity: 1, scale: 1, y: 0 },
  },
};

export function Reveal({
  children,
  as = "div",
  variant = "fade-up",
  delayMs = 0,
  className,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.div;
  const variants = VARIANTS[variant];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -8% 0px" }}
      variants={variants}
      transition={{
        type: "spring",
        stiffness: 88,
        damping: 18,
        delay: delayMs / 1000,
      }}
    >
      {children}
    </MotionTag>
  );
}

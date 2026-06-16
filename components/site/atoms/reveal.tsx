"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  as?: "div" | "section" | "li" | "span";
  variant?: "fade-up" | "clip";
  delayMs?: number;
  className?: string;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const clip: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  show: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
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
  const variants = variant === "clip" ? clip : fadeUp;

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

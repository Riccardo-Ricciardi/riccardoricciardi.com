"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

interface RevealProps {
  children: React.ReactNode;
  as?: "div" | "section" | "li" | "span";
  variant?: "fade-up" | "clip";
  delayMs?: number;
  className?: string;
}

export function Reveal({
  children,
  as: Tag = "div",
  variant = "fade-up",
  delayMs = 0,
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(variant === "fade-up" ? "reveal" : "reveal-clip", className)}
      data-inview={inView ? "true" : "false"}
      style={delayMs ? ({ "--enter-delay": `${delayMs}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

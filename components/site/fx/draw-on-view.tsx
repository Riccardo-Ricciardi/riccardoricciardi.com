"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

interface DrawOnViewProps {
  children: React.ReactNode;
  className?: string;
}

/** Adds `.drawn` once scrolled into view. Paired with the `.draw-svg` rules in
 *  fx.css, this stroke-draws any child shape that carries `pathLength={1}`.
 *  Reduced motion: marked drawn immediately (CSS transition is also disabled). */
export function DrawOnView({ children, className }: DrawOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("draw-svg", drawn && "drawn", className)}>
      {children}
    </div>
  );
}

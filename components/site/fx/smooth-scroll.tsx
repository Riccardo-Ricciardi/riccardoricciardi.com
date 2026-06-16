"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide smooth scroll (premium inertia). Disabled under reduced-motion.
 * Drives native window scroll, so IntersectionObserver reveals, the
 * ScrollSpine and anchor offsets keep working.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    document.documentElement.classList.add("lenis-on");

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.documentElement.classList.remove("lenis-on");
    };
  }, []);

  return null;
}

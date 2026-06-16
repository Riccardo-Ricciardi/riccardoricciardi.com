"use client";

import { useEffect, useRef } from "react";

/**
 * Page-wide signature: a single "trace" of light that runs the full scroll.
 * A glowing node descends the left rail as you scroll; the rail charges
 * (accent) above it, dim below. One rAF-throttled CSS var drives compositor
 * transforms only (scaleY + translateY). Off under reduced-motion.
 */
export function ScrollSpine() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let bound = false;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      el.style.setProperty("--spine", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const bind = () => {
      update();
      if (bound || reduceQuery.matches) return;
      bound = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    };
    const unbind = () => {
      if (!bound) return;
      bound = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    const onMotion = () => {
      if (reduceQuery.matches) unbind();
      bind();
    };

    bind();
    reduceQuery.addEventListener("change", onMotion);

    return () => {
      cancelAnimationFrame(raf);
      unbind();
      reduceQuery.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="scroll-spine"
      style={{ "--spine": 0 } as React.CSSProperties}
    >
      <span className="scroll-spine-rail" />
      <span className="scroll-spine-charge" />
      <span className="scroll-spine-node" />
    </div>
  );
}

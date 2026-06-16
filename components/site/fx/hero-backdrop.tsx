"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroCanvas = dynamic(() => import("./hero-canvas"), { ssr: false });

/**
 * Hero background. The CSS poster (grid + glow) is always painted so it is
 * LCP-safe and serves as the fallback on mobile / reduced-motion / no-WebGL.
 * The WebGL data-surface loads after idle, only on capable desktops, and
 * fades in over the poster.
 */
export function HeroBackdrop() {
  const [show3d, setShow3d] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallOrTouch =
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;

    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }

    if (reduced || smallOrTouch || !webgl) return;

    const mount = () => setShow3d(true);
    const id =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback(mount, { timeout: 1200 })
        : window.setTimeout(mount, 400);
    return () => {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(id);
      else clearTimeout(id as number);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-grid-fade absolute inset-0" />
      <div className="glow-radial absolute inset-x-0 -top-24 h-[600px] opacity-70" />
      {show3d && (
        <div className="hero-canvas-fade absolute inset-0">
          <HeroCanvas />
        </div>
      )}
    </div>
  );
}

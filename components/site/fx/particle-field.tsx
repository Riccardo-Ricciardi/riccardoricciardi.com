"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  accent: boolean;
}

interface ParticleFieldProps {
  density?: number;
  maxParticles?: number;
  linkDistance?: number;
  className?: string;
}

const POINTER_RADIUS = 140;

export function ParticleField({
  density = 6,
  maxParticles = 90,
  linkDistance = 120,
  className,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;

    let raf = 0;
    let resizeRaf = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let fg = "oklch(0.7 0 0)";
    let accent = "oklch(0.62 0.19 260)";
    let pageVisible = true;
    let inView = true;
    let idleReady = false;
    let rectLeft = 0;
    let rectTop = 0;
    const pointer = { clientX: -9999, clientY: -9999, active: false };

    const readPalette = () => {
      const styles = getComputedStyle(document.documentElement);
      fg = styles.getPropertyValue("--muted-foreground").trim() || fg;
      accent = styles.getPropertyValue("--accent-blue").trim() || accent;
    };

    const targetCount = () =>
      Math.min(
        maxParticles,
        Math.round(((width * height) / 100_000) * density)
      );

    const seed = () => {
      particles = Array.from({ length: targetCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1 + Math.random() * 1.4,
        accent: Math.random() < 0.18,
      }));
    };

    const drawFrame = (dt: number) => {
      ctx.clearRect(0, 0, width, height);

      let px = -9999;
      let py = -9999;
      let pointerActive = false;
      if (pointer.active) {
        px = pointer.clientX - rectLeft;
        py = pointer.clientY - rectTop;
        pointerActive = px >= 0 && py >= 0 && px <= width && py <= height;
      }

      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (pointerActive) {
          const dx = p.x - px;
          const dy = p.y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < POINTER_RADIUS * POINTER_RADIUS && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / POINTER_RADIUS) * 0.6;
            p.x += (dx / d) * force * dt;
            p.y += (dy / d) * force * dt;
          }
        }
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDistance * linkDistance) {
            ctx.globalAlpha = (1 - Math.sqrt(d2) / linkDistance) * 0.18;
            ctx.strokeStyle = a.accent || b.accent ? accent : fg;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.globalAlpha = p.accent ? 0.8 : 0.45;
        ctx.fillStyle = p.accent ? accent : fg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      drawFrame(dt);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (!idleReady || reduced || !pageVisible || !inView) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const measure = () => {
      const r = canvas.getBoundingClientRect();
      width = r.width;
      height = r.height;
      rectLeft = r.left;
      rectTop = r.top;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resize = () => {
      const prevW = width;
      const prevH = height;
      measure();
      if (particles.length === 0 || targetCount() !== particles.length) {
        seed();
      } else if (prevW > 0 && prevH > 0 && (prevW !== width || prevH !== height)) {
        const sx = width / prevW;
        const sy = height / prevH;
        for (const p of particles) {
          p.x *= sx;
          p.y *= sy;
        }
      }
      if (reduced) drawFrame(0);
    };

    const scheduleResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    };

    const onMove = (event: MouseEvent) => {
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onScroll = () => {
      const r = canvas.getBoundingClientRect();
      rectLeft = r.left;
      rectTop = r.top;
    };
    let pointerBound = false;
    const bindPointer = () => {
      if (pointerBound) return;
      pointerBound = true;
      onScroll();
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseout", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
    };
    const unbindPointer = () => {
      if (!pointerBound) return;
      pointerBound = false;
      pointer.active = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("scroll", onScroll);
    };

    readPalette();
    resize();
    // defer the first animation frame off the LCP critical path.
    // gate ALL start() paths (incl. IntersectionObserver) behind idleReady.
    const armIdle = () => {
      idleReady = true;
      start();
    };
    const idleStart =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback(armIdle, { timeout: 800 })
        : window.setTimeout(armIdle, 200);

    const resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(parent);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) {
        bindPointer();
        start();
      } else {
        unbindPointer();
        cancelAnimationFrame(raf);
      }
    });
    intersectionObserver.observe(parent);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMotionChange = () => {
      reduced = motionQuery.matches;
      if (reduced) {
        cancelAnimationFrame(raf);
        drawFrame(0);
      } else {
        start();
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    const themeObserver = new MutationObserver(readPalette);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idleStart);
      else clearTimeout(idleStart);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      unbindPointer();
    };
  }, [density, maxParticles, linkDistance]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}

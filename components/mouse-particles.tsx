"use client";

import { useEffect, useRef } from "react";

interface MouseParticlesProps {
  className?: string;
  count?: number;
  linkDistance?: number;
  repelRadius?: number;
}

export function MouseParticles({
  className = "",
  count = 55,
  linkDistance = 110,
  repelRadius = 130,
}: MouseParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let cssW = 0;
    let cssH = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    const particles: P[] = Array.from({ length: count }, () => ({
      x: Math.random() * cssW,
      y: Math.random() * cssH,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
    }));

    const mouse = { x: -9999, y: -9999, active: false };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active =
        mouse.x >= 0 && mouse.x <= cssW && mouse.y >= 0 && mouse.y <= cssH;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    window.addEventListener("resize", resize);

    const readAccent = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-blue")
        .trim();
      return v || "#3b82f6";
    };

    let raf = 0;
    let frame = 0;
    let accent = readAccent();

    const tick = () => {
      frame++;
      if (frame % 60 === 0) accent = readAccent();

      ctx.clearRect(0, 0, cssW, cssH);

      for (const p of particles) {
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          const r2 = repelRadius * repelRadius;
          if (d2 < r2 && d2 > 0.001) {
            const d = Math.sqrt(d2);
            const f = (1 - d / repelRadius) * 0.6;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vx += (Math.random() - 0.5) * 0.015;
        p.vy += (Math.random() - 0.5) * 0.015;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x += cssW;
        else if (p.x > cssW) p.x -= cssW;
        if (p.y < 0) p.y += cssH;
        else if (p.y > cssH) p.y -= cssH;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.55;
        ctx.fill();
      }

      ctx.lineWidth = 0.6;
      ctx.strokeStyle = accent;
      const linkDist2 = linkDistance * linkDistance;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist2) {
            const alpha = (1 - d2 / linkDist2) * 0.18;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [count, linkDistance, repelRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}

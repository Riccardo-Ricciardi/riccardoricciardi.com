"use client";

import { useEffect, useRef, useState } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const LINK_DIST = 150;
const MOUSE_DIST = 190;
const MAX_NODES = 80;
const MIN_NODES = 28;

type Palette = { node: string; line: string; accent: string };

function paletteFor(dark: boolean): Palette {
  return dark
    ? {
        node: "210, 216, 230",
        line: "200, 208, 228",
        accent: "96, 132, 255",
      }
    : {
        node: "60, 70, 92",
        line: "70, 82, 110",
        accent: "48, 86, 220",
      };
}

/**
 * Faint 2D constellation: low-density drifting nodes linked by short lines,
 * gently reactive to the cursor. Pure canvas 2D, kept deliberately sparse and
 * low-opacity so it reads as atmosphere, never as a foreground layer.
 */
function Field() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let palette = paletteFor(
      document.documentElement.classList.contains("dark")
    );
    const mouse = { x: -9999, y: -9999, active: false };

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const build = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(
        MIN_NODES,
        Math.min(MAX_NODES, Math.round((width * height) / 24000))
      );
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: rand(-0.18, 0.18),
        vy: rand(-0.18, 0.18),
      }));
    };

    build();

    const onResize = () => build();
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onTheme = () => {
      palette = paletteFor(
        document.documentElement.classList.contains("dark")
      );
    };

    window.addEventListener("resize", onResize, { passive: true });
    if (!coarse) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave, { passive: true });
    }
    const themeObs = new MutationObserver(onTheme);
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    let raf = 0;
    let running = true;

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVisibility);

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = width + 20;
        else if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        else if (n.y > height + 20) n.y = -20;

        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_DIST * MOUSE_DIST && d2 > 1) {
            const d = Math.sqrt(d2);
            const pull = (1 - d / MOUSE_DIST) * 0.4;
            n.x += (dx / d) * pull;
            n.y += (dy / d) * pull;
          }
        }
      }

      // links between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const t = 1 - Math.sqrt(d2) / LINK_DIST;
            ctx.strokeStyle = `rgba(${palette.line}, ${(t * 0.16).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // links to cursor + node dots
      for (const n of nodes) {
        let near = false;
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_DIST * MOUSE_DIST) {
            const t = 1 - Math.sqrt(d2) / MOUSE_DIST;
            near = t > 0.12;
            ctx.strokeStyle = `rgba(${palette.accent}, ${(t * 0.32).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = near
          ? `rgba(${palette.accent}, 0.7)`
          : `rgba(${palette.node}, 0.38)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, near ? 1.7 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObs.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full [mask-image:radial-gradient(130%_120%_at_50%_30%,#000_60%,transparent_100%)]"
    />
  );
}

/**
 * Mounts the constellation on capable, motion-friendly clients only.
 * Reduced-motion falls back to the flat background.
 */
export function Constellation() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
  }, []);

  if (!show) return null;
  return <Field />;
}

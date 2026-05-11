"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";
import { useTheme } from "next-themes";

interface CalEmbedProps {
  username: string;
  eventSlug?: string;
  heading: string;
  description: string;
  ctaLabel: string;
}

type Stub = ((...args: unknown[]) => void) & {
  ns?: Record<string, (...args: unknown[]) => void>;
  loaded?: boolean;
  q?: unknown[];
};

declare global {
  interface Window {
    Cal?: Stub;
  }
}

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

function brandPalette(isDark: boolean) {
  const accent = readVar("--accent-blue", isDark ? "#3b82f6" : "#2563eb");
  const accentHover = readVar(
    "--accent-blue-hover",
    isDark ? "#60a5fa" : "#3b82f6"
  );
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const bgMuted = isDark ? "#1f1f1f" : "#fafafa";
  const bgEmphasis = isDark ? "#262626" : "#f0f0f0";
  const text = isDark ? "#fafafa" : "#0a0a0a";
  const textMuted = isDark ? "#a1a1aa" : "#71717a";
  const textEmphasis = isDark ? "#ffffff" : "#000000";
  const border = isDark ? "#3a3a3a" : "#d4d4d8";
  const borderMuted = isDark ? "#2a2a2a" : "#e4e4e7";

  return {
    "cal-brand": accent,
    "cal-brand-emphasis": accentHover,
    "cal-brand-text": "#ffffff",
    "cal-brand-subtle": isDark
      ? "rgba(59, 130, 246, 0.2)"
      : "rgba(37, 99, 235, 0.12)",
    "cal-bg": bg,
    "cal-bg-muted": bgMuted,
    "cal-bg-emphasis": bgEmphasis,
    "cal-bg-inverted": isDark ? "#fafafa" : "#0a0a0a",
    "cal-border": border,
    "cal-border-muted": borderMuted,
    "cal-border-emphasis": accent,
    "cal-border-booker": "transparent",
    "cal-border-booker-width": "0",
    "cal-text": text,
    "cal-text-muted": textMuted,
    "cal-text-emphasis": textEmphasis,
    "cal-text-inverted": isDark ? "#0a0a0a" : "#ffffff",
  };
}

export function CalEmbed({
  username,
  eventSlug = "30min",
  heading,
  description,
  ctaLabel,
}: CalEmbedProps) {
  const base = `https://cal.com/${username}/${eventSlug}`;
  const calLink = `${username}/${eventSlug}`;
  const namespace = eventSlug.replace(/[^a-zA-Z0-9_-]/g, "_");
  const elementId = `cal-inline-${namespace}`;

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;

    const C = window;
    const A = "https://app.cal.com/embed/embed.js";

    if (!C.Cal) {
      const stub: Stub = function (this: unknown, ...args: unknown[]) {
        (stub.q = stub.q || []).push(args);
      } as Stub;
      stub.ns = {};
      stub.q = [];
      C.Cal = stub;

      const script = document.createElement("script");
      script.src = A;
      document.head.appendChild(script);
      stub.loaded = true;
    }

    const cal = C.Cal;
    if (!cal) return;

    cal("init", namespace, { origin: "https://cal.com" });

    const ns = cal.ns?.[namespace];
    if (!ns) return;

    const isDark = resolvedTheme === "dark";

    ns("inline", {
      elementOrSelector: `#${elementId}`,
      calLink,
      layout: "month_view",
    });
    ns("ui", {
      theme: isDark ? "dark" : "light",
      hideEventTypeDetails: true,
      layout: "month_view",
      cssVarsPerTheme: {
        light: brandPalette(false),
        dark: brandPalette(true),
      },
      styles: {
        branding: { brandColor: readVar("--accent-blue", "#2563eb") },
      },
    });
  }, [mounted, calLink, namespace, elementId, resolvedTheme]);

  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-dashed-soft bg-card">
      <header className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-dashed border-dashed-soft text-accent-blue">
            <Calendar className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
              {heading}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Link
          href={base}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-lg border border-dashed border-dashed-soft bg-background px-3.5 text-sm font-medium transition-colors hover:border-accent-blue hover:text-accent-blue md:self-auto"
        >
          {ctaLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>
      <div
        id={elementId}
        className="cal-inline-host min-h-[640px] w-full border-t border-dashed border-dashed-soft"
      />
    </div>
  );
}

"use client";

import { useEffect } from "react";
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

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & {
      ns?: Record<string, (...args: unknown[]) => void>;
    };
  }
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      const C = window as typeof window & {
        Cal?: ((...args: unknown[]) => void) & {
          ns?: Record<string, (...args: unknown[]) => void>;
          loaded?: boolean;
          q?: unknown[];
        };
      };
      const A = "https://app.cal.com/embed/embed.js";

      if (!C.Cal) {
        type Stub = ((...args: unknown[]) => void) & {
          ns?: Record<string, (...args: unknown[]) => void>;
          loaded?: boolean;
          q?: unknown[];
        };
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
      if (ns) {
        ns("inline", {
          elementOrSelector: `#${elementId}`,
          calLink,
          layout: "month_view",
        });
        ns("ui", {
          theme: resolvedTheme === "dark" ? "dark" : "light",
          hideEventTypeDetails: false,
          layout: "month_view",
        });
      }
    };

    init();
  }, [calLink, namespace, elementId, resolvedTheme]);

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
        className="min-h-[640px] w-full border-t border-dashed border-dashed-soft"
      />
    </div>
  );
}

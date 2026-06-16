"use client";

import { useSyncExternalStore } from "react";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

interface GlobalLoaderProps {
  fullscreen?: boolean;
  label?: string;
}

function subscribeDark(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getDarkSnapshot(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function getDarkServerSnapshot(): boolean {
  return false;
}

export function GlobalLoader({ fullscreen = true, label }: GlobalLoaderProps) {
  const isDark = useSyncExternalStore(
    subscribeDark,
    getDarkSnapshot,
    getDarkServerSnapshot,
  );
  const color = isDark ? "#60a5fa" : "#2563eb";

  if (!fullscreen) {
    return (
      <output
        className="flex w-full items-center justify-center py-16"
        aria-live="polite"
        aria-label={label || undefined}
      >
        <Bouncy size="60" speed="2" color={color} />
      </output>
    );
  }

  return (
    <output
      className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-background"
      aria-live="polite"
      aria-label={label || undefined}
    >
      <Bouncy size="100" speed="2" color={color} />
    </output>
  );
}

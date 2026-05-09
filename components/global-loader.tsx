"use client";

import { useEffect, useState } from "react";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

interface GlobalLoaderProps {
  fullscreen?: boolean;
}

export function GlobalLoader({ fullscreen = true }: GlobalLoaderProps) {
  const [color, setColor] = useState("#2563eb");

  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    setColor(isDark ? "#60a5fa" : "#2563eb");
  }, []);

  if (!fullscreen) {
    return (
      <div
        className="flex w-full items-center justify-center py-16"
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <Bouncy size="60" speed="2" color={color} />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <Bouncy size="100" speed="2" color={color} />
    </div>
  );
}

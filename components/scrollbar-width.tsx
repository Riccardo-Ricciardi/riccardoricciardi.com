"use client";

import { useEffect } from "react";

export function ScrollbarWidth() {
  useEffect(() => {
    const root = document.documentElement;

    function update() {
      const w = window.innerWidth - root.clientWidth;
      root.style.setProperty("--scrollbar-w", `${Math.max(0, w)}px`);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return null;
}

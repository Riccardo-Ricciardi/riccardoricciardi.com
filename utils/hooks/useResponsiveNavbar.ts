"use client";

import { useEffect, useState, type RefObject } from "react";
import { APP_CONFIG } from "@/utils/config/app";

interface UseResponsiveNavbarParams {
  containerRef: RefObject<HTMLElement | null>;
  desktopProbeRef: RefObject<HTMLElement | null>;
}

export function useResponsiveNavbar({
  containerRef,
  desktopProbeRef,
}: UseResponsiveNavbarParams) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const probe = desktopProbeRef.current;

      if (!container || !probe) return;

      const availableWidth = container.clientWidth;
      const desktopRequiredWidth =
        probe.scrollWidth +
        APP_CONFIG.navbar.logoWidthPx +
        APP_CONFIG.navbar.controlsWidthPx +
        APP_CONFIG.navbar.safetyGapPx;

      setIsMobile(desktopRequiredWidth > availableWidth);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (desktopProbeRef.current) resizeObserver.observe(desktopProbeRef.current);

    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, desktopProbeRef]);

  return isMobile;
}

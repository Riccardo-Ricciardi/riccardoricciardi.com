"use client";

import { useEffect, useState } from "react";
import { APP_CONFIG } from "@/utils/config/app";

export const useIsMobile = (breakpoint = APP_CONFIG.mobileBreakpointPx) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const updateState = () => setIsMobile(mediaQuery.matches);

    updateState();
    mediaQuery.addEventListener("change", updateState);

    return () => mediaQuery.removeEventListener("change", updateState);
  }, [breakpoint]);

  return isMobile;
};

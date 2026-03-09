"use client";

import { useEffect, useState, type RefObject } from "react";

interface UseResponsiveNavbarParams {
  containerRef: RefObject<HTMLElement | null>;
  logoRef: RefObject<HTMLElement | null>;
  linksRef: RefObject<HTMLElement | null>;
  controlsRef: RefObject<HTMLElement | null>;
}

export function useResponsiveNavbar({
  containerRef,
  logoRef,
  linksRef,
  controlsRef,
}: UseResponsiveNavbarParams) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const logo = logoRef.current;
      const links = linksRef.current;
      const controls = controlsRef.current;

      if (!container || !logo || !links || !controls) return;

      const containerStyle = window.getComputedStyle(container);
      const containerGap = Number.parseFloat(containerStyle.columnGap || "0") || 0;

      const requiredWidth =
        logo.getBoundingClientRect().width +
        links.scrollWidth +
        controls.getBoundingClientRect().width +
        containerGap;

      setIsMobile(requiredWidth > container.clientWidth);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (logoRef.current) resizeObserver.observe(logoRef.current);
    if (linksRef.current) resizeObserver.observe(linksRef.current);
    if (controlsRef.current) resizeObserver.observe(controlsRef.current);

    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, logoRef, linksRef, controlsRef]);

  return isMobile;
}

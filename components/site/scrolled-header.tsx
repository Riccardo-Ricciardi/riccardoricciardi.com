"use client";

import { useEffect, useState } from "react";

interface ScrolledHeaderProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  threshold?: number;
}

export function ScrolledHeader({
  children,
  className = "",
  ariaLabel,
  threshold = 8,
}: ScrolledHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </header>
  );
}

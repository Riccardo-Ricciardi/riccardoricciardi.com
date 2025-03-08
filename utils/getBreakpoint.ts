import { useEffect } from "react";

export function breakpoint(
  h1Ref: HTMLHeadingElement | null,
  ulRef: HTMLUListElement | null,
  navRef: HTMLDivElement | null
) {
  if (!h1Ref || !ulRef || !navRef) return;

  const h1Width = h1Ref.getBoundingClientRect().width;
  const ulWidth = ulRef.getBoundingClientRect().width;
  const totalNavbarWidth = h1Width + ulWidth;

  const navWidth = navRef.getBoundingClientRect().width;
  const screenWidth = window.innerWidth;

  if (totalNavbarWidth >= navWidth) {
    console.log(`Navbar non va più bene per lo schermo a ${screenWidth}px`);
  }
}

export function useBreakpoint(
  h1Ref: React.RefObject<HTMLHeadingElement | null>,
  ulRef: React.RefObject<HTMLUListElement | null>,
  navRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const handleResize = () => {
      if (h1Ref.current && ulRef.current && navRef.current) {
        breakpoint(h1Ref.current, ulRef.current, navRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [h1Ref, ulRef, navRef]);
}

// // js:
// import { useBreakpoint } from "@/utils/getBreakpoint";
// import { useRef, useState, useEffect } from "react";

// const h1Ref = useRef<HTMLHeadingElement | null>(null);
// const ulRef = useRef<HTMLUListElement | null>(null);
// const navRef = useRef<HTMLDivElement | null>(null);

// useBreakpoint(h1Ref, ulRef, navRef, setScreenWidth);

// // html:
// <div ref={navRef}

// <h1 ref={h1Ref}

// <ul ref={ulRef}

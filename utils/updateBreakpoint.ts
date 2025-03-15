import { useState, useEffect } from "react";

export function useIsMobile(
  containerRef: React.RefObject<HTMLDivElement>,
  headerRef: React.RefObject<HTMLHeadingElement>,
  contentRef: React.RefObject<HTMLDivElement>
) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      if (!containerRef.current || !headerRef.current || !contentRef.current) {
        return;
      }

      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const headerWidth = headerRef.current.getBoundingClientRect().width;
      const contentWidth = contentRef.current.getBoundingClientRect().width;
      const totalChildrenWidth = headerWidth + contentWidth;

      const newIsMobile = totalChildrenWidth > containerWidth;
      const screenWidth = window.innerWidth;

      if (newIsMobile !== isMobile) {
        console.log(
          `Switching to ${
            newIsMobile ? "MOBILE" : "DESKTOP"
          } mode at screen width: ${screenWidth}px`
        );
        setIsMobile(newIsMobile);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, [containerRef, headerRef, contentRef, isMobile]);

  return isMobile;
}

// import { useRef } from "react";
// import { useIsMobile } from "@/utils/updateBreakpoint";

// const containerRef = useRef<HTMLDivElement>(null!);
// const headerRef = useRef<HTMLHeadingElement>(null!);
// const contentRef = useRef<HTMLDivElement>(null!);

// const isMobile = useIsMobile(containerRef, headerRef, contentRef);

// ref = { containerRef }
// ref = { headerRef }
// ref = { contentRef }

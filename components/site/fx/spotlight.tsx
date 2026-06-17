"use client";

interface SpotlightGroupProps {
  children: React.ReactNode;
  className?: string;
}

/** Delegated cursor-glow controller. Wrap a group of cards that carry the
 *  `.spotlight` class (fx.css); on pointer move it feeds --mx/--my to whichever
 *  card is under the cursor so its radial glow tracks the pointer. One listener,
 *  cards stay server components. */
export function SpotlightGroup({ children, className }: SpotlightGroupProps) {
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".spotlight");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div onPointerMove={onMove} className={className}>
      {children}
    </div>
  );
}

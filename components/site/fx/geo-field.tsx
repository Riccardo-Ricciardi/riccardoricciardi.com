type Shape =
  | "triangle"
  | "square"
  | "hexagon"
  | "circle"
  | "ring"
  | "plus"
  | "diamond";

interface GeoItem {
  type: Shape;
  top: string;
  left: string;
  size: number;
  dur: number;
  delay: number;
  dx: number;
  dy: number;
  rot: number;
  opacity: number;
}

// Signature: a constellation of simple geometric outlines drifting site-wide.
const ITEMS: GeoItem[] = [
  { type: "triangle", top: "13%", left: "7%", size: 64, dur: 27, delay: 0, dx: 16, dy: -22, rot: 42, opacity: 0.18 },
  { type: "ring", top: "20%", left: "83%", size: 92, dur: 35, delay: 2, dx: -20, dy: 16, rot: -32, opacity: 0.13 },
  { type: "square", top: "58%", left: "11%", size: 50, dur: 31, delay: 1, dx: 12, dy: 20, rot: 52, opacity: 0.15 },
  { type: "hexagon", top: "70%", left: "80%", size: 74, dur: 39, delay: 3, dx: -14, dy: -18, rot: 36, opacity: 0.14 },
  { type: "plus", top: "41%", left: "47%", size: 30, dur: 23, delay: 0.5, dx: 10, dy: -14, rot: 90, opacity: 0.2 },
  { type: "diamond", top: "86%", left: "38%", size: 42, dur: 29, delay: 2.5, dx: -12, dy: -16, rot: 46, opacity: 0.13 },
  { type: "circle", top: "9%", left: "54%", size: 26, dur: 21, delay: 1.5, dx: 14, dy: 18, rot: 0, opacity: 0.18 },
  { type: "triangle", top: "49%", left: "91%", size: 52, dur: 33, delay: 4, dx: -16, dy: 14, rot: -42, opacity: 0.13 },
  { type: "ring", top: "90%", left: "19%", size: 38, dur: 25, delay: 0, dx: 12, dy: -12, rot: 30, opacity: 0.15 },
  { type: "square", top: "31%", left: "29%", size: 28, dur: 28, delay: 3.5, dx: -10, dy: 16, rot: -52, opacity: 0.14 },
  { type: "hexagon", top: "14%", left: "66%", size: 40, dur: 37, delay: 1, dx: 14, dy: 20, rot: 26, opacity: 0.12 },
  { type: "plus", top: "79%", left: "60%", size: 26, dur: 22, delay: 2, dx: -12, dy: -14, rot: 90, opacity: 0.17 },
];

function ShapeSvg({ type }: { type: Shape }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    vectorEffect: "non-scaling-stroke" as const,
  };
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      {type === "triangle" && <polygon points="50,9 92,86 8,86" {...common} />}
      {type === "square" && (
        <rect x="11" y="11" width="78" height="78" rx="2" {...common} />
      )}
      {type === "hexagon" && (
        <polygon points="50,6 89,28 89,72 50,94 11,72 11,28" {...common} />
      )}
      {type === "circle" && <circle cx="50" cy="50" r="42" {...common} />}
      {type === "ring" && <circle cx="50" cy="50" r="40" {...common} />}
      {type === "diamond" && (
        <polygon points="50,8 92,50 50,92 8,50" {...common} />
      )}
      {type === "plus" && <path d="M50 14 V86 M14 50 H86" {...common} />}
    </svg>
  );
}

/**
 * Site-wide geometric signature: simple outlined shapes that drift + rotate
 * slowly behind all content, identical on every page. Pure CSS animation
 * (no JS / WebGL), so it runs everywhere; static under reduced-motion.
 */
export function GeoField() {
  return (
    <div aria-hidden="true" className="geo-field">
      {ITEMS.map((it, i) => (
        <div
          key={i}
          className="geo-shape"
          style={
            {
              top: it.top,
              left: it.left,
              width: it.size,
              height: it.size,
              opacity: Math.min(it.opacity + 0.14, 0.42),
              "--geo-dur": `${it.dur}s`,
              "--geo-delay": `${it.delay}s`,
              "--geo-dx": `${it.dx}px`,
              "--geo-dy": `${it.dy}px`,
              "--geo-rot": `${it.rot}deg`,
            } as React.CSSProperties
          }
        >
          <ShapeSvg type={it.type} />
        </div>
      ))}
    </div>
  );
}

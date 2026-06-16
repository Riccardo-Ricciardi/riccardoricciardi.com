import { cn } from "@/utils/cn";

export interface SystemNode {
  id: string;
  label: string;
}

interface SystemMapProps {
  systems: SystemNode[];
  centerLabel?: string;
  baseDelayMs?: number;
  className?: string;
}

const CENTER = { x: 260, y: 210 };

const POSITIONS = [
  { x: 430, y: 78, anchor: "middle", labelDy: -14 },
  { x: 466, y: 244, anchor: "end", labelDy: 24 },
  { x: 356, y: 360, anchor: "middle", labelDy: 24 },
  { x: 120, y: 330, anchor: "middle", labelDy: 24 },
  { x: 86, y: 104, anchor: "middle", labelDy: -14 },
] as const;

function curve(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const bend = 18;
  const cx = mx - (dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M ${from.x} ${from.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`;
}

export function SystemMap({
  systems,
  centerLabel = "RR",
  baseDelayMs = 200,
  className,
}: SystemMapProps) {
  const nodes = systems.slice(0, POSITIONS.length);

  return (
    <svg
      viewBox="0 0 520 420"
      aria-hidden="true"
      className={cn("h-auto w-full select-none", className)}
    >
      {/* alone diffuso dietro al core */}
      <circle
        cx={CENTER.x}
        cy={CENTER.y}
        r={110}
        fill="var(--glow-strong)"
        opacity={0.5}
        className="fx-core-soft"
      />
      <circle
        cx={CENTER.x}
        cy={CENTER.y}
        r={72}
        fill="var(--accent-blue-soft)"
        opacity={0.6}
        className="fx-core-soft"
      />

      {nodes.map((node, index) => {
        const pos = POSITIONS[index];
        const d = curve(CENTER, pos);
        const drawDelay = `${baseDelayMs + index * 140}ms`;
        // beam travel: fasi sfalsate via delay negativo → distribuite subito
        const traceDelay = `${-(index * 1.1).toFixed(2)}s`;
        // clamp so long/localized labels never overflow the fixed viewBox
        const label =
          node.label.length > 16 ? `${node.label.slice(0, 15)}…` : node.label;
        return (
          <g key={node.id}>
            {/* base path tenue (si disegna una volta) */}
            <path
              d={d}
              pathLength={1}
              fill="none"
              stroke="var(--fg-subtle)"
              strokeOpacity={0.4}
              strokeWidth={1}
              className="fx-line"
              style={{ "--fx-delay": drawDelay } as React.CSSProperties}
            />
            {/* segnale che viaggia dal core verso il nodo */}
            <path
              d={d}
              pathLength={1}
              fill="none"
              strokeWidth={1.5}
              strokeLinecap="round"
              className="fx-trace"
              style={{ "--fx-delay": traceDelay } as React.CSSProperties}
            />
            <circle
              cx={pos.x}
              cy={pos.y}
              r={3.5}
              fill="var(--accent-blue)"
            />
            <circle
              cx={pos.x}
              cy={pos.y}
              r={6.5}
              fill="none"
              stroke="var(--accent-blue)"
              strokeOpacity={0.25}
            />
            <text
              x={pos.x}
              y={pos.y + pos.labelDy}
              textAnchor={pos.anchor}
              fontSize={10}
              fill="var(--fg-muted)"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </text>
          </g>
        );
      })}

      <g>
        <rect
          x={CENTER.x - 30}
          y={CENTER.y - 30}
          width={60}
          height={60}
          rx={10}
          fill="var(--card)"
          stroke="var(--accent-blue)"
          strokeOpacity={0.5}
        />
        <text
          x={CENTER.x}
          y={CENTER.y + 5}
          textAnchor="middle"
          fontSize={16}
          fontWeight={600}
          fill="var(--foreground)"
          style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            letterSpacing: "0.05em",
          }}
        >
          {centerLabel}
        </text>
      </g>
    </svg>
  );
}

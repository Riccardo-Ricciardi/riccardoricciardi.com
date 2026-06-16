import { cn } from "@/utils/cn";

interface TelemetryLineProps {
  stateLabel: string;
  segments?: string[];
  className?: string;
}

export function TelemetryLine({
  stateLabel,
  segments = [],
  className,
}: TelemetryLineProps) {
  return (
    <p className={cn("text-telemetry flex items-center gap-2", className)}>
      <span className="uppercase tracking-[0.08em] text-foreground">
        {stateLabel}
      </span>
      {segments.slice(0, 2).map((segment) => (
        <span key={segment} className="flex items-center gap-2">
          <span aria-hidden="true" className="text-fg-subtle">
            ·
          </span>
          {segment}
        </span>
      ))}
    </p>
  );
}

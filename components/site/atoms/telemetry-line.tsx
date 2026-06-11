import { cn } from "@/utils/cn";
import {
  StatusDot,
  type ProjectStatus,
} from "@/components/site/atoms/status-dot";

interface TelemetryLineProps {
  state: ProjectStatus;
  stateLabel: string;
  segments?: string[];
  className?: string;
}

export function TelemetryLine({
  state,
  stateLabel,
  segments = [],
  className,
}: TelemetryLineProps) {
  return (
    <p className={cn("text-telemetry flex items-center gap-2", className)}>
      <StatusDot state={state} />
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

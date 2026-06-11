import { cn } from "@/utils/cn";

export type ProjectStatus = "live" | "shipped" | "archived";

interface StatusDotProps {
  state: ProjectStatus;
  className?: string;
}

export function StatusDot({ state, className }: StatusDotProps) {
  return (
    <span
      className={cn("status-dot", className)}
      data-state={state}
      aria-hidden="true"
    />
  );
}

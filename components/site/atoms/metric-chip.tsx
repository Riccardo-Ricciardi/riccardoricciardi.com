import { cn } from "@/utils/cn";

interface MetricChipProps {
  children: React.ReactNode;
  className?: string;
}

export function MetricChip({ children, className }: MetricChipProps) {
  return <span className={cn("chip-metric", className)}>{children}</span>;
}

import { cn } from "@/utils/cn";

interface LogEntryProps {
  date: string;
  children: React.ReactNode;
  className?: string;
}

export function LogEntry({ date, children, className }: LogEntryProps) {
  return (
    <li className={cn("flex items-baseline gap-4 py-2", className)}>
      <time className="text-telemetry w-16 shrink-0 text-fg-muted">
        {date}
      </time>
      <span className="text-body-sm text-foreground">{children}</span>
    </li>
  );
}

import { cn } from "@/lib/utils";

interface TechChipProps {
  children: React.ReactNode;
  className?: string;
}

export function TechChip({ children, className }: TechChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed-soft bg-background px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

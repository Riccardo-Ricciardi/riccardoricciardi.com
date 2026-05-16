import { cn } from "@/utils/cn";

type PillTone = "default" | "mono" | "accent" | "soft";

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
  interactive?: boolean;
  asChild?: never;
}

export function Pill({
  tone = "default",
  interactive = false,
  className,
  children,
  ...rest
}: PillProps) {
  return (
    <span
      className={cn(
        "pill-base",
        tone === "mono" && "pill-mono",
        tone === "accent" && "pill-accent",
        tone === "soft" && "pill-soft",
        interactive && "pill-interactive",
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

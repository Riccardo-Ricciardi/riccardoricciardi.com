import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "accent" | "warn" | "ok";
  className?: string;
}

const toneRing: Record<NonNullable<StatProps["tone"]>, string> = {
  default: "",
  accent: "ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent-blue)_25%,transparent)]",
  warn: "ring-1 ring-inset ring-amber-500/25",
  ok: "ring-1 ring-inset ring-emerald-500/25",
};

export function Stat({ label, value, hint, icon: Icon, tone = "default", className }: StatProps) {
  return (
    <div className={cn("admin-card relative px-4 py-4", toneRing[tone], className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="admin-eyebrow truncate">{label}</p>
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint && (
        <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

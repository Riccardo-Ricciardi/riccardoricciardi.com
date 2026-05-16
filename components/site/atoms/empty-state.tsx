import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Eyebrow } from "@/components/site/atoms/eyebrow";

interface EmptyStateAction {
  href: string;
  label: string;
}

interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "card-base card-pad-lg flex flex-col items-center gap-4 text-center",
        className
      )}
    >
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-pill border border-dashed-soft bg-background/60 text-accent-blue">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <div className="flex flex-col items-center gap-2">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h3 className="text-h3 text-balance">{title}</h3>
        {description && (
          <p className="text-body-sm max-w-prose text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link href={action.href} className="btn-base btn-primary mt-1">
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

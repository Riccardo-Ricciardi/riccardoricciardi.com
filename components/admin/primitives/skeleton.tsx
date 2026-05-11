import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("admin-skeleton h-4 w-full", className)} {...props} />;
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div
      className="grid gap-3 px-3 py-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="admin-card p-5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-7 w-24" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="admin-card overflow-hidden">
      <SkeletonRow cols={cols} />
      <div className="admin-divider border-t" />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </div>
  );
}

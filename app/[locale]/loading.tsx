export default function Loading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-live="polite">
      <div className="h-10 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(80px,1fr))]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg border border-grid bg-muted/40"
          />
        ))}
      </div>
    </div>
  );
}

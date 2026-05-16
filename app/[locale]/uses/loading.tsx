export default function Loading() {
  return (
    <section className="container-page section-divider-b section-y">
      <div className="mb-12 flex flex-col gap-3 md:mb-16">
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>

      <div className="flex flex-col gap-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="h-20 animate-pulse rounded-surface bg-muted"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

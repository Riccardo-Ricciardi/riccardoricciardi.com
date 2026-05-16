export default function Loading() {
  return (
    <section className="container-page section-divider-b section-y">
      <div className="mb-12 flex flex-col gap-3 md:mb-16">
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-12 lg:gap-16">
        <div className="aspect-[4/5] w-full max-w-sm animate-pulse rounded-surface bg-muted" />

        <div className="flex flex-col gap-8 md:gap-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <div className="h-3 w-6 animate-pulse rounded bg-muted" />
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="ml-9 flex flex-col gap-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

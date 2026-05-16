export default function Loading() {
  return (
    <section className="container-page section-divider-b section-y">
      <div className="content-narrow">
        <div className="mb-12 flex flex-col gap-3 md:mb-16">
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>

        <div className="flex flex-col gap-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-6 border-b border-dashed-soft py-8 first:border-t"
            >
              <div className="flex flex-col items-center gap-2 pt-1">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted" />
                <div className="w-px flex-1 animate-pulse bg-muted" />
              </div>
              <div className="flex flex-1 flex-col gap-3 pb-2">
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

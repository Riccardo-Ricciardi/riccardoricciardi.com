export default function Loading() {
  return (
    <section className="container-page section-divider-b section-y">
      <div className="mb-12 flex flex-col gap-3 md:mb-16">
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>

      <div className="flex flex-col">
        <div className="mb-8 h-3 w-32 animate-pulse self-end rounded bg-muted" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={
              "grid gap-x-12 gap-y-6 py-10 first:pt-0 md:grid-cols-[11rem_1fr]" +
              (i > 0 ? " border-t border-border" : "")
            }
          >
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="flex flex-col gap-6">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex flex-col gap-2">
                  <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full max-w-prose animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-border pt-8 md:mt-24">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="size-6 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <>
      <section className="container-page pt-20 md:pt-28 lg:pt-32">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
          <div className="h-9 w-72 animate-pulse rounded bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted" />
          <div className="mt-4 flex gap-2">
            <div className="h-7 w-32 animate-pulse rounded-pill bg-muted" />
            <div className="h-7 w-40 animate-pulse rounded-pill bg-muted" />
          </div>
          <div className="mt-3 h-3 w-48 animate-pulse rounded bg-muted" />
        </div>
      </section>

      <section className="container-page pb-20 pt-10 md:pb-28 md:pt-12">
        <div className="mx-auto w-full max-w-2xl lg:max-w-none">
          <div className="flex gap-3 lg:hidden">
            <div className="h-11 flex-1 animate-pulse rounded-control bg-muted" />
            <div className="h-11 flex-1 animate-pulse rounded-control bg-muted" />
          </div>
          <div className="mt-6 grid items-start gap-10 lg:mt-0 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-4">
              <div className="hidden h-6 w-32 animate-pulse rounded bg-muted lg:block" />
              <div className="h-11 w-full animate-pulse rounded-control bg-muted" />
              <div className="h-11 w-full animate-pulse rounded-control bg-muted" />
              <div className="h-28 w-full animate-pulse rounded-control bg-muted" />
              <div className="h-11 w-32 animate-pulse rounded-control bg-muted" />
            </div>
            <div className="hidden flex-col gap-4 lg:flex">
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
              <div className="h-80 w-full animate-pulse rounded-surface bg-muted" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

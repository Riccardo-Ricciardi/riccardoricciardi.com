export default function Loading() {
  return (
    <>
      <section className="container-page section-y">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex flex-col items-center gap-3">
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            <div className="h-9 w-72 animate-pulse rounded bg-muted" />
            <div className="h-4 w-80 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </section>

      <section className="container-page pb-16 pt-10 md:pt-12">
        <div className="mx-auto max-w-2xl flex flex-col gap-4">
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-28 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-11 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </section>
    </>
  );
}

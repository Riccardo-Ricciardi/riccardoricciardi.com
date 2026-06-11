import { CaseStudiesSkeleton } from "@/components/site/work/case-studies";
import { ShippingLogSkeleton } from "@/components/site/work/shipping-log";
import { GithubStripSkeleton } from "@/components/site/work/github-strip";

export default function Loading() {
  return (
    <>
      <section className="container-page section-divider-b section-y">
        <div className="content-narrow flex flex-col gap-3">
          <div className="h-9 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full max-w-prose animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 max-w-prose animate-pulse rounded bg-muted" />
        </div>
      </section>
      <CaseStudiesSkeleton />
      <ShippingLogSkeleton />
      <GithubStripSkeleton />
    </>
  );
}

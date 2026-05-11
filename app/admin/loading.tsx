import { SectionHeader } from "@/components/admin/primitives/section-header";
import { SkeletonCard, SkeletonTable } from "@/components/admin/primitives/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader eyebrow="Loading" title="…" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={5} cols={4} />
    </div>
  );
}

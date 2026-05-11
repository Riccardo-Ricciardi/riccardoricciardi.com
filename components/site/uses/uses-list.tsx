import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/site/atoms/eyebrow";
import type { UsesItem } from "@/utils/uses/fetch";

interface UsesListProps {
  items: UsesItem[];
}

export function UsesList({ items }: UsesListProps) {
  if (items.length === 0) return null;

  const grouped = new Map<string, UsesItem[]>();
  for (const item of items) {
    const arr = grouped.get(item.category) ?? [];
    arr.push(item);
    grouped.set(item.category, arr);
  }

  const categories = Array.from(grouped.keys());

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {categories.map((category) => (
        <section key={category}>
          <Eyebrow as="span">{category}</Eyebrow>
          <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.get(category)!.map((item) => (
              <li key={item.id}>
                <UsesCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function UsesCard({ item }: { item: UsesItem }) {
  const className =
    "group relative flex h-full flex-col gap-3 card-base card-interactive no-underline";

  const Inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-dashed-soft bg-background/60">
          {item.icon_url ? (
            <Image
              src={item.icon_url}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
              unoptimized
            />
          ) : (
            <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground">
              {item.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
        {item.url && (
          <ArrowUpRight
            className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-blue"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-body-sm truncate font-medium tracking-tight">
          {item.name}
        </p>
        {item.description && (
          <p className="text-caption mt-1 line-clamp-3 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </>
  );

  if (item.url) {
    return (
      <Link
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {Inner}
      </Link>
    );
  }

  return <div className={className}>{Inner}</div>;
}

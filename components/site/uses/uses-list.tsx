import { ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";
import type { UsesItem } from "@/utils/uses/fetch";

interface UsesListProps {
  items: UsesItem[];
}

const CATEGORY_ORDER = [
  "Hardware",
  "Editor",
  "Tooling",
  "Hosting",
  "AI Services",
];

export function UsesList({ items }: UsesListProps) {
  if (items.length === 0) return null;

  const grouped = new Map<string, UsesItem[]>();
  for (const item of items) {
    const arr = grouped.get(item.category) ?? [];
    arr.push(item);
    grouped.set(item.category, arr);
  }

  const categories = Array.from(grouped.keys()).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return (
    <div className="flex flex-col">
      {categories.map((category, idx) => (
        <section
          key={category}
          aria-label={category}
          className={cn(
            "grid gap-x-12 gap-y-6 py-10 first:pt-0 last:pb-0 md:grid-cols-[11rem_1fr]",
            idx > 0 && "border-t border-border"
          )}
        >
          <h2 className="text-h3">{category}</h2>
          <ul className="flex list-none flex-col gap-6 p-0">
            {grouped.get(category)!.map((item) => (
              <li key={item.id} className="flex flex-col gap-1">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start font-medium tracking-tight transition-colors hover:text-signal"
                  >
                    {item.name}
                    <ArrowUpRight
                      className="mb-0.5 ml-1 inline size-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </a>
                ) : (
                  <span className="font-medium tracking-tight">{item.name}</span>
                )}
                {item.description && (
                  <p className="text-body-sm max-w-prose text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

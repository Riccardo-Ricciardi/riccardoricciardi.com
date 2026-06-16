"use client";

import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";

interface Props {
  slugs: string[];
  languages: Array<{ id: number; code: string; name: string }>;
  values: Map<string, string>;
  fieldPrefix: "content" | "notfound";
  bulkAction: (formData: FormData) => Promise<void>;
  deleteSlugAction: (formData: FormData) => Promise<void>;
}

function groupOf(slug: string): string {
  const i = slug.indexOf("_");
  return i === -1 ? slug : slug.slice(0, i);
}

export function TranslationGrid({
  slugs,
  languages,
  values,
  fieldPrefix,
  bulkAction,
  deleteSlugAction,
}: Props) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const slug of slugs) {
      const key = groupOf(slug);
      const list = map.get(key) ?? [];
      list.push(slug);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [slugs]);

  if (slugs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed admin-divider bg-background/40 px-4 py-6 text-center text-sm text-muted-foreground">
        No slugs yet.
      </p>
    );
  }

  const q = query.trim().toLowerCase();
  const matches = (slug: string) => q === "" || slug.toLowerCase().includes(q);

  return (
    <form action={bulkAction} className="flex flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter slugs…"
        aria-label="Filter slugs"
        className="admin-input w-full sm:max-w-xs"
      />

      <div className="flex flex-col gap-2">
        {groups.map(([group, groupSlugs]) => {
          const visibleCount = groupSlugs.filter(matches).length;
          if (visibleCount === 0) return null;
          return (
            <details
              key={group}
              open={q !== ""}
              className="admin-card overflow-hidden"
            >
              <summary className="cursor-pointer select-none px-3 py-2.5 text-sm font-medium">
                <span className="font-mono">{group}</span>
                <span className="ml-2 text-muted-foreground">
                  {visibleCount}
                </span>
              </summary>
              <div className="flex flex-col divide-y admin-divider border-t admin-divider">
                {groupSlugs.map((slug) => (
                  <div
                    key={slug}
                    hidden={!matches(slug)}
                    className="grid gap-3 p-3 lg:grid-cols-[14rem_minmax(0,1fr)_2.5rem]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm">{slug}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {languages.map((l) => {
                        const name = `${fieldPrefix}[${slug}][lang_${l.id}]`;
                        const v = values.get(`${slug}::${l.id}`) ?? "";
                        return (
                          <label key={l.id} className="flex flex-col gap-1.5">
                            <span className="admin-eyebrow">{l.code}</span>
                            <textarea
                              name={name}
                              defaultValue={v}
                              rows={2}
                              className="admin-input min-h-16 resize-y"
                            />
                          </label>
                        );
                      })}
                    </div>
                    <div className="flex items-start justify-end">
                      <DeleteButton
                        action={deleteSlugAction}
                        fieldValue={slug}
                        label={`slug "${slug}"`}
                        iconOnly
                      />
                    </div>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving…">
          Save all translations
        </SubmitButton>
      </div>
    </form>
  );
}

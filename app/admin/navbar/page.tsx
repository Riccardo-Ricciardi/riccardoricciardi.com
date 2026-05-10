import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  bulkUpdateNavbarAction,
  createNavbarMultilangAction,
  deleteNavbarSlugAction,
  moveNavbarSlugAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { SearchBox } from "@/components/admin/search-box";

export const dynamic = "force-dynamic";

interface NavRow {
  id: number;
  slug: string | null;
  value: string;
  language_id: number;
  position: number | null;
}

interface Lang {
  id: number;
  code: string;
  name: string;
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function NavbarAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { q } = await searchParams;
  const supabase = createAdminClient();

  const [{ data: rows }, { data: languages }] = await Promise.all([
    supabase
      .from("navbar")
      .select("id, slug, value, language_id, position")
      .order("position", { ascending: true }),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
  ]);

  const langs = (languages ?? []) as Lang[];
  const navRows = (rows ?? []) as NavRow[];

  // Group rows by slug
  const slugMap = new Map<string, Map<number, NavRow>>();
  for (const r of navRows) {
    const slug = r.slug ?? "";
    const m = slugMap.get(slug) ?? new Map<number, NavRow>();
    m.set(r.language_id, r);
    slugMap.set(slug, m);
  }

  const allSlugs = Array.from(slugMap.keys()).sort((a, b) => {
    const posA = Math.min(
      ...Array.from(slugMap.get(a)!.values()).map((r) => r.position ?? 0)
    );
    const posB = Math.min(
      ...Array.from(slugMap.get(b)!.values()).map((r) => r.position ?? 0)
    );
    return posA - posB;
  });
  const query = (q ?? "").toLowerCase().trim();
  const slugs = query
    ? allSlugs.filter((s) => {
        if (s.toLowerCase().includes(query)) return true;
        const byLang = slugMap.get(s)!;
        for (const row of byLang.values()) {
          if ((row.value ?? "").toLowerCase().includes(query)) return true;
        }
        return false;
      })
    : allSlugs;

  // Detect missing translations (across all slugs, not filtered)
  const missing: { slug: string; missing: string[] }[] = [];
  for (const slug of allSlugs) {
    const byLang = slugMap.get(slug)!;
    const missingCodes = langs
      .filter((l) => !byLang.has(l.id))
      .map((l) => l.code);
    if (missingCodes.length > 0) {
      missing.push({ slug, missing: missingCodes });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Translations
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Navbar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One row per slug, columns per language. Empty cells = missing
            translation. Click Save to apply all changes at once.
            {query && (
              <span className="ml-1 font-mono text-xs">
                — {slugs.length}/{allSlugs.length} matching{" "}
                <span className="text-accent-blue">&quot;{query}&quot;</span>
              </span>
            )}
          </p>
        </div>
        <SearchBox placeholder="Search slug or label…" />
      </header>

      {missing.length > 0 && (
        <div className="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
          <p className="font-medium">Missing translations</p>
          <ul className="mt-1 list-disc pl-4">
            {missing.map((m) => (
              <li key={m.slug}>
                <span className="font-mono">{m.slug || "(home)"}</span> →{" "}
                missing in {m.missing.join(", ")}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[10px]">
            Fill the empty cells in the table below and Save.
          </p>
        </div>
      )}

      {/* Bulk-edit table */}
      {slugs.length > 0 && (
        <form action={bulkUpdateNavbarAction} className="flex flex-col gap-3">
          <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-dashed border-dashed-soft text-left">
                  <th className="w-24 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Order
                  </th>
                  <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Slug
                  </th>
                  {langs.map((l) => (
                    <th
                      key={l.id}
                      className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                    >
                      {l.code} label
                    </th>
                  ))}
                  <th className="w-20 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {slugs.map((slug, index) => {
                  const byLang = slugMap.get(slug)!;
                  const firstRow = Array.from(byLang.values())[0];
                  const position = firstRow?.position ?? 0;
                  return (
                    <tr
                      key={slug}
                      className="border-b border-dashed border-dashed-soft last:border-b-0"
                    >
                      <td className="px-3 py-2">
                        <input
                          type="hidden"
                          name={`nav[${slug}][position]`}
                          value={position}
                        />
                        <div className="flex items-center gap-1">
                          <span className="w-5 font-mono text-xs tabular-nums text-muted-foreground">
                            {index + 1}
                          </span>
                          <button
                            type="submit"
                            formAction={moveNavbarSlugAction}
                            formNoValidate
                            disabled={index === 0}
                            name={`move:${slug}:up`}
                            value="1"
                            aria-label="Move up"
                            className="rounded p-0.5 text-muted-foreground hover:text-accent-blue disabled:opacity-30 disabled:hover:text-muted-foreground"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="submit"
                            formAction={moveNavbarSlugAction}
                            formNoValidate
                            disabled={index === slugs.length - 1}
                            name={`move:${slug}:down`}
                            value="1"
                            aria-label="Move down"
                            className="rounded p-0.5 text-muted-foreground hover:text-accent-blue disabled:opacity-30 disabled:hover:text-muted-foreground"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          name={`nav[${slug}][slug]`}
                          defaultValue={slug}
                          placeholder="(home)"
                          className="w-full rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1.5 font-mono text-xs focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </td>
                      {langs.map((l) => {
                        const row = byLang.get(l.id);
                        const isMissing = !row;
                        return (
                          <td key={l.id} className="px-3 py-2">
                            <input
                              name={`nav[${slug}][value][${l.id}]`}
                              defaultValue={row?.value ?? ""}
                              placeholder={isMissing ? "(missing)" : ""}
                              className={`w-full rounded-md border border-dashed bg-background px-2 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                isMissing
                                  ? "border-amber-500/40 placeholder:text-amber-600/70"
                                  : "border-dashed-soft"
                              }`}
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right">
                        <DeleteButton
                          action={deleteNavbarSlugAction}
                          fieldName="delete"
                          fieldValue={slug}
                          label={`navbar item "${slug || "(home)"}"`}
                          description="Removes the entry across all languages. This cannot be undone."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <SubmitButton
            className="w-full bg-accent-blue text-white"
            pendingLabel="Saving…"
          >
            Save all
          </SubmitButton>
        </form>
      )}

      {/* Add new — single form with one label per language */}
      <section id="add" className="scroll-mt-24">
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Add new item (fill all languages at once)
        </h2>
        <form
          action={createNavbarMultilangAction}
          className="flex flex-col gap-3 rounded-lg border border-dashed border-dashed-soft p-4"
        >
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Slug (empty for home)
            </span>
            <input
              name="slug"
              type="text"
              placeholder="about"
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {langs.map((l) => (
              <label key={l.id} className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {l.code} label
                </span>
                <input
                  name={`label_${l.code}`}
                  type="text"
                  placeholder={`Label in ${l.name}`}
                  className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            ))}
          </div>
          <SubmitButton
            className="w-full bg-accent-blue text-white"
            pendingLabel="Adding…"
          >
            Add for all languages
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}

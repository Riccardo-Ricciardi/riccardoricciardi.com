import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  bulkUpdateNavbarAction,
  createNavbarAction,
  deleteNavbarSlugAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

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
  searchParams: Promise<{ error?: string; ok?: string }>;
}

export default async function NavbarAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error, ok } = await searchParams;
  const supabase = await createClient();

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

  const slugs = Array.from(slugMap.keys()).sort((a, b) => {
    const posA = Math.min(
      ...Array.from(slugMap.get(a)!.values()).map((r) => r.position ?? 0)
    );
    const posB = Math.min(
      ...Array.from(slugMap.get(b)!.values()).map((r) => r.position ?? 0)
    );
    return posA - posB;
  });

  // Detect missing translations
  const missing: { slug: string; missing: string[] }[] = [];
  for (const slug of slugs) {
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
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Navbar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One row per slug, columns per language. Empty cells = missing
          translation. Click Save to apply all changes at once.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-dashed border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-600"
        >
          {error}
        </p>
      )}
      {ok && (
        <p
          role="status"
          className="rounded-md border border-dashed border-accent-blue bg-accent-blue-soft px-3 py-2 text-xs text-accent-blue"
        >
          Changes saved
        </p>
      )}

      {missing.length > 0 && (
        <div className="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
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
                  <th className="w-16 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Pos
                  </th>
                  <th className="w-20 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {slugs.map((slug) => {
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
                          name={`nav[${slug}][slug]`}
                          defaultValue={slug}
                          placeholder="(home)"
                          className="w-full rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1 font-mono text-xs focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                              className={`w-full rounded-md border border-dashed bg-background px-2 py-1 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                isMissing
                                  ? "border-amber-500/40 placeholder:text-amber-600/70"
                                  : "border-dashed-soft"
                              }`}
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2">
                        <input
                          name={`nav[${slug}][position]`}
                          type="number"
                          defaultValue={position}
                          className="w-14 rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="submit"
                          formAction={deleteNavbarSlugAction}
                          formNoValidate
                          name="slug"
                          value={slug}
                          className="font-mono text-[10px] uppercase tracking-wider text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-accent-blue text-white">
              Save all
            </Button>
          </div>
        </form>
      )}

      {/* Add new */}
      <section>
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Add slug (creates one empty row per language to fill in)
        </h2>
        <form
          action={createNavbarAction}
          className="grid grid-cols-2 items-end gap-2 rounded-lg border border-dashed border-dashed-soft p-3 sm:grid-cols-12"
        >
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Lang
            </span>
            <select
              name="language_id"
              required
              className="rounded-md border border-dashed border-dashed-soft bg-background px-2.5 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {langs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 sm:col-span-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Slug
            </span>
            <input
              name="slug"
              type="text"
              placeholder="about"
              className="rounded-md border border-dashed border-dashed-soft bg-background px-2.5 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Label
            </span>
            <input
              name="value"
              type="text"
              required
              className="rounded-md border border-dashed border-dashed-soft bg-background px-2.5 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Pos
            </span>
            <input
              name="position"
              type="number"
              defaultValue="0"
              className="rounded-md border border-dashed border-dashed-soft bg-background px-2.5 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <Button
            type="submit"
            size="sm"
            className="bg-accent-blue text-white sm:col-span-2"
          >
            Add
          </Button>
        </form>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Tip: add the same slug for one language, then fill the empty cells in
          the table for the other languages and Save.
        </p>
      </section>
    </div>
  );
}

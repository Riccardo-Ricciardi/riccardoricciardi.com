import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  createNavbarAction,
  deleteNavbarAction,
  updateNavbarAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { LangTabs } from "@/components/admin/lang-tabs";

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
  searchParams: Promise<{ error?: string }>;
}

export default async function NavbarAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: rows }, { data: languages }] = await Promise.all([
    supabase
      .from("navbar")
      .select("id, slug, value, language_id, position")
      .order("language_id", { ascending: true })
      .order("position", { ascending: true }),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
  ]);

  const langs = (languages ?? []) as Lang[];
  const navRows = (rows ?? []) as NavRow[];
  const grouped = new Map<number, NavRow[]>();
  for (const r of navRows) {
    const arr = grouped.get(r.language_id) ?? [];
    arr.push(r);
    grouped.set(r.language_id, arr);
  }
  const knownSlugs = Array.from(
    new Set(navRows.map((r) => (r.slug ?? "").trim()))
  )
    .filter(Boolean)
    .sort();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Navbar</h1>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-dashed border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-600"
        >
          {error}
        </p>
      )}

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Add new
        </h2>
        <form
          action={createNavbarAction}
          className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-dashed-soft p-4 sm:grid-cols-5"
        >
          <label className="flex flex-col gap-1.5 sm:col-span-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Language
            </span>
            <select
              name="language_id"
              required
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {langs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} — {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Slug (empty=home)
            </span>
            <input
              name="slug"
              type="text"
              list="known-slugs"
              placeholder="about"
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <datalist id="known-slugs">
              {knownSlugs.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <Field label="Label" name="value" required />
          <Field label="Position" name="position" type="number" defaultValue="0" />
          <div className="self-end">
            <Button type="submit" className="bg-accent-blue text-white">
              Add
            </Button>
          </div>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: add the same slug across all languages so the URL works.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Items per language
        </h2>
        <LangTabs
          storageKey="admin.lang"
          langs={langs}
          panels={langs.map((lang) => (
            <ul
              key={lang.id}
              className="flex flex-col gap-2 list-none p-0"
            >
              {(grouped.get(lang.id) ?? []).length === 0 && (
                <li className="text-sm text-muted-foreground">
                  No items for this language yet.
                </li>
              )}
              {(grouped.get(lang.id) ?? []).map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-dashed border-dashed-soft p-4"
                >
                  <form
                    action={updateNavbarAction}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-5"
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <label className="flex flex-col gap-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Slug
                      </span>
                      <input
                        name="slug"
                        type="text"
                        list="known-slugs"
                        defaultValue={row.slug ?? ""}
                        className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </label>
                    <Field
                      label="Label"
                      name="value"
                      defaultValue={row.value}
                      required
                      className="sm:col-span-2"
                    />
                    <Field
                      label="Position"
                      name="position"
                      type="number"
                      defaultValue={(row.position ?? 0).toString()}
                    />
                    <div className="flex items-end gap-2">
                      <Button type="submit" size="sm" variant="outline">
                        Save
                      </Button>
                    </div>
                  </form>
                  <form
                    action={deleteNavbarAction}
                    className="mt-3 flex justify-end"
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      className="border-red-500/40 text-red-600 hover:bg-red-500/5 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          ))}
        />
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

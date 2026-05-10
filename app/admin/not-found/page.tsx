import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  bulkUpdateNotFoundSlugAction,
  createNotFoundSlugAction,
  deleteNotFoundSlugAction,
} from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/submit-button";

export const dynamic = "force-dynamic";

interface Row {
  id: number;
  slug: string;
  value: string;
  language_id: number;
  position: number | null;
}

interface Lang {
  id: number;
  code: string;
  name: string;
}

export default async function NotFoundAdmin() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: rows }, { data: languages }] = await Promise.all([
    supabase
      .from("not_found")
      .select("id, slug, value, language_id, position")
      .order("position", { ascending: true }),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
  ]);

  const langs = (languages ?? []) as Lang[];
  const allRows = (rows ?? []) as Row[];

  const bySlug = new Map<string, Map<number, Row>>();
  for (const r of allRows) {
    const m = bySlug.get(r.slug) ?? new Map<number, Row>();
    m.set(r.language_id, r);
    bySlug.set(r.slug, m);
  }

  const slugs = Array.from(bySlug.keys()).sort((a, b) => {
    const posA = Math.min(
      ...Array.from(bySlug.get(a)!.values()).map((r) => r.position ?? 0)
    );
    const posB = Math.min(
      ...Array.from(bySlug.get(b)!.values()).map((r) => r.position ?? 0)
    );
    return posA - posB;
  });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Translations
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          404 strings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Per-locale strings rendered on the 404 page. Edit all locales on a
          row and click Save to push them at once.
        </p>
      </header>

      {slugs.map((slug) => (
        <form
          key={`form-${slug}`}
          action={bulkUpdateNotFoundSlugAction}
          id={`nf-${slug}`}
          className="hidden"
        >
          <input type="hidden" name="slug" value={slug} />
        </form>
      ))}

      {slugs.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-dashed border-dashed-soft text-left">
                <Th className="w-44">Slug</Th>
                {langs.map((l) => (
                  <Th key={l.id}>{l.code}</Th>
                ))}
                <Th className="w-32" />
              </tr>
            </thead>
            <tbody>
              {slugs.map((slug) => {
                const formId = `nf-${slug}`;
                return (
                  <tr
                    key={slug}
                    className="border-b border-dashed border-dashed-soft last:border-b-0"
                  >
                    <td className="px-3 py-2 align-top">
                      <p className="font-mono text-xs">{slug}</p>
                    </td>
                    {langs.map((l) => {
                      const row = bySlug.get(slug)?.get(l.id);
                      return (
                        <td key={l.id} className="px-3 py-2 align-top">
                          <input
                            form={formId}
                            name={`value_${l.id}`}
                            type="text"
                            defaultValue={row?.value ?? ""}
                            className="w-full min-w-[160px] rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center justify-end gap-2">
                        <SubmitButton
                          form={formId}
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          pendingLabel="Saving…"
                        >
                          Save
                        </SubmitButton>
                        <DeleteButton
                          action={deleteNotFoundSlugAction}
                          fieldName="delete"
                          fieldValue={slug}
                          label={`404 string "${slug}"`}
                          description="Removes the slug across all languages."
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <section>
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Add new slug
        </h2>
        <form
          action={createNotFoundSlugAction}
          className="flex flex-col gap-3 rounded-lg border border-dashed border-dashed-soft p-4 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Slug (e.g. title, back_home)
            </span>
            <input
              name="slug"
              type="text"
              required
              pattern="[a-z][a-z0-9_]*"
              placeholder="title"
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 font-mono text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <SubmitButton variant="outline" pendingLabel="Creating…">
            Create empty rows
          </SubmitButton>
        </form>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Order in code = position. The dictionary returns these as a string
          array indexed by position. Don&apos;t reorder unless the public 404
          page also adapts.
        </p>
      </section>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

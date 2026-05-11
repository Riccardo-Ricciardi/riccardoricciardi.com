import { Plus, Wrench } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { EmptyState } from "@/components/admin/primitives/empty-state";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import {
  bulkUpdateUsesAction,
  createUsesItemAction,
  deleteUsesItemAction,
  upsertUsesI18nAction,
} from "@/app/admin/_actions/uses";

export const dynamic = "force-dynamic";

interface UsesRow {
  id: number;
  category: string;
  name: string;
  url: string | null;
  icon_url: string | null;
  position: number;
  visible: boolean;
}

interface I18nRow {
  item_id: number;
  language_id: number;
  description: string | null;
}

interface Lang {
  id: number;
  code: string;
  name: string;
}

export default async function UsesAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [rowsRes, langsRes, i18nRes] = await Promise.all([
    supabase
      .from("uses_items")
      .select("id, category, name, url, icon_url, position, visible")
      .order("category", { ascending: true })
      .order("position", { ascending: true }),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase
      .from("uses_items_i18n")
      .select("item_id, language_id, description"),
  ]);

  const rows = (rowsRes.data ?? []) as UsesRow[];
  const langs = (langsRes.data ?? []) as Lang[];
  const i18nRows = (i18nRes.data ?? []) as I18nRow[];

  const i18nMap = new Map<string, I18nRow>();
  for (const r of i18nRows) {
    i18nMap.set(`${r.item_id}::${r.language_id}`, r);
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Site"
        title="Uses"
        description="Hardware, editors, libraries, services shown on /[locale]/uses, grouped by category."
      />

      <form
        action={createUsesItemAction}
        className="admin-card grid grid-cols-1 gap-2 p-3 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Category</span>
          <input
            name="category"
            required
            placeholder="Editor"
            className="admin-input"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Name</span>
          <input
            name="name"
            required
            placeholder="Cursor"
            className="admin-input"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">URL</span>
          <input
            name="url"
            placeholder="https://"
            className="admin-input"
          />
        </label>
        <div className="flex items-end">
          <SubmitButton className="w-full" pendingLabel="Adding…">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add item
          </SubmitButton>
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No items yet"
          description="Add hardware, editors, libraries, services. They group by category on the public page."
        />
      ) : (
        <form action={bulkUpdateUsesAction} className="flex flex-col gap-4">
          <ul className="flex list-none flex-col gap-2 p-0">
            {rows.map((row) => (
              <li key={row.id} className="admin-card flex flex-col gap-3 p-3">
                <input
                  type="hidden"
                  name={`uses[${row.id}][__row]`}
                  value="1"
                />
                <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)_5rem_2.5rem_3rem]">
                  <input
                    name={`uses[${row.id}][category]`}
                    defaultValue={row.category}
                    required
                    aria-label="Category"
                    className="admin-input"
                  />
                  <input
                    name={`uses[${row.id}][name]`}
                    defaultValue={row.name}
                    required
                    aria-label="Name"
                    className="admin-input"
                  />
                  <input
                    name={`uses[${row.id}][url]`}
                    defaultValue={row.url ?? ""}
                    placeholder="URL"
                    aria-label="URL"
                    className="admin-input"
                  />
                  <input
                    name={`uses[${row.id}][position]`}
                    type="number"
                    defaultValue={row.position}
                    aria-label="Position"
                    className="admin-input tabular-nums"
                  />
                  <label className="flex h-11 items-center justify-center">
                    <input
                      type="checkbox"
                      name={`uses[${row.id}][visible]`}
                      defaultChecked={row.visible}
                      aria-label="Visible"
                      className="h-4 w-4 accent-[var(--accent-blue)]"
                    />
                  </label>
                  <DeleteButton
                    action={deleteUsesItemAction}
                    fieldValue={row.id}
                    label={`${row.name} (${row.category})`}
                    iconOnly
                  />
                </div>
                <input
                  type="hidden"
                  name={`uses[${row.id}][icon_url]`}
                  defaultValue={row.icon_url ?? ""}
                />

                <details className="rounded-md border border-dashed admin-divider bg-background/40 px-3 py-2">
                  <summary className="admin-eyebrow cursor-pointer">
                    Translations
                  </summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {langs.map((l) => {
                      const i18n = i18nMap.get(`${row.id}::${l.id}`);
                      return (
                        <form
                          key={l.id}
                          action={upsertUsesI18nAction}
                          className="rounded-md border admin-divider bg-card p-2.5"
                        >
                          <input
                            type="hidden"
                            name="item_id"
                            value={row.id}
                          />
                          <input
                            type="hidden"
                            name="language_id"
                            value={l.id}
                          />
                          <p className="admin-eyebrow mb-1.5">{l.code}</p>
                          <textarea
                            name="description"
                            defaultValue={i18n?.description ?? ""}
                            rows={2}
                            placeholder="What you use it for…"
                            className="admin-input min-h-16 resize-y"
                          />
                          <div className="mt-2 flex justify-end">
                            <SubmitButton pendingLabel="Saving…">
                              Save {l.code}
                            </SubmitButton>
                          </div>
                        </form>
                      );
                    })}
                  </div>
                </details>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving…">
              Save items
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}

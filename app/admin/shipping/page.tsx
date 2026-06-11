import { Plus, Rocket } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { EmptyState } from "@/components/admin/primitives/empty-state";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import {
  bulkUpdateShippingAction,
  createShippingEntryAction,
  deleteShippingEntryAction,
  upsertShippingI18nAction,
} from "@/app/admin/_actions/shipping";

export const dynamic = "force-dynamic";

interface ShippingRow {
  id: number;
  happened_on: string;
  position: number;
  visible: boolean;
}

interface I18nRow {
  log_id: number;
  language_id: number;
  body: string;
}

interface Lang {
  id: number;
  code: string;
  name: string;
}

export default async function ShippingAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [logRes, langsRes, i18nRes] = await Promise.all([
    supabase
      .from("shipping_log")
      .select("id, happened_on, position, visible")
      .order("happened_on", { ascending: false }),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase.from("shipping_log_i18n").select("log_id, language_id, body"),
  ]);

  const rows = (logRes.data ?? []) as ShippingRow[];
  const langs = (langsRes.data ?? []) as Lang[];
  const i18nRows = (i18nRes.data ?? []) as I18nRow[];

  const i18nMap = new Map<string, I18nRow>();
  for (const r of i18nRows) {
    i18nMap.set(`${r.log_id}::${r.language_id}`, r);
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Site"
        title="Shipping log"
        description="Dated proof-of-work entries shown on /[locale]/work. Sorted by date, newest first."
      />

      <form
        action={createShippingEntryAction}
        className="admin-card grid grid-cols-1 gap-2 p-3 sm:grid-cols-[10rem_auto]"
      >
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Date</span>
          <input
            name="happened_on"
            type="date"
            required
            className="admin-input"
          />
        </label>
        <div className="flex items-end">
          <SubmitButton className="w-full" pendingLabel="Adding…">
            <Plus className="size-3.5" aria-hidden="true" />
            Add entry
          </SubmitButton>
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No entries yet"
          description="Add a dated entry above. The body per language lives inside each entry."
        />
      ) : (
        <form action={bulkUpdateShippingAction} className="flex flex-col gap-4">
          <ul className="flex list-none flex-col gap-3 p-0">
            {rows.map((row) => (
              <li key={row.id} className="admin-card flex flex-col gap-4 p-4">
                <input
                  type="hidden"
                  name={`ship[${row.id}][__row]`}
                  value="1"
                />
                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="admin-eyebrow">Date</span>
                    <input
                      type="date"
                      name={`ship[${row.id}][happened_on]`}
                      defaultValue={row.happened_on}
                      required
                      className="admin-input"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 pb-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      name={`ship[${row.id}][visible]`}
                      defaultChecked={row.visible}
                      className="size-3.5 rounded accent-[var(--accent-blue)]"
                    />
                    <span>Visible on site</span>
                  </label>
                  <div className="ml-auto">
                    <DeleteButton
                      action={deleteShippingEntryAction}
                      fieldValue={row.id}
                      label={`entry ${row.happened_on}`}
                      iconOnly
                    />
                  </div>
                </div>

                <details className="rounded-lg border admin-divider bg-background/40 px-3 py-2">
                  <summary className="admin-eyebrow cursor-pointer">
                    Body per language
                  </summary>
                  <div className="mt-3 flex flex-col gap-4">
                    {langs.map((l) => {
                      const i18n = i18nMap.get(`${row.id}::${l.id}`);
                      return (
                        <form
                          key={l.id}
                          action={upsertShippingI18nAction}
                          className="rounded-md border admin-divider bg-card p-3"
                        >
                          <input type="hidden" name="log_id" value={row.id} />
                          <input
                            type="hidden"
                            name="language_id"
                            value={l.id}
                          />
                          <p className="admin-eyebrow mb-2">{l.code}</p>
                          <label className="flex flex-col gap-1.5">
                            <span className="admin-eyebrow">Body</span>
                            <textarea
                              name="body"
                              defaultValue={i18n?.body ?? ""}
                              rows={2}
                              className="admin-input min-h-16 resize-y"
                            />
                          </label>
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
              Save metadata
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}

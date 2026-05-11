import { Briefcase, Plus } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { EmptyState } from "@/components/admin/primitives/empty-state";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import {
  bulkUpdateWorkAction,
  createWorkAction,
  deleteWorkAction,
  upsertWorkI18nAction,
} from "@/app/admin/_actions/work";

export const dynamic = "force-dynamic";

interface WorkRow {
  id: number;
  company: string;
  role: string;
  url: string | null;
  location: string | null;
  started_at: string;
  ended_at: string | null;
  is_current: boolean;
  position: number;
}

interface I18nRow {
  experience_id: number;
  language_id: number;
  summary: string | null;
  bullets: string[] | null;
}

interface Lang {
  id: number;
  code: string;
  name: string;
}

export default async function WorkAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [workRes, langsRes, i18nRes] = await Promise.all([
    supabase
      .from("work_experience")
      .select(
        "id, company, role, url, location, started_at, ended_at, is_current, position"
      )
      .order("started_at", { ascending: false }),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase
      .from("work_experience_i18n")
      .select("experience_id, language_id, summary, bullets"),
  ]);

  const rows = (workRes.data ?? []) as WorkRow[];
  const langs = (langsRes.data ?? []) as Lang[];
  const i18nRows = (i18nRes.data ?? []) as I18nRow[];

  const i18nMap = new Map<string, I18nRow>();
  for (const r of i18nRows) {
    i18nMap.set(`${r.experience_id}::${r.language_id}`, r);
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Site"
        title="Work timeline"
        description="Career history shown on /[locale]/work. Sorted automatically by start date."
      />

      <form
        action={createWorkAction}
        className="admin-card grid grid-cols-1 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9rem_auto]"
      >
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Company</span>
          <input name="company" required className="admin-input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Role</span>
          <input name="role" required className="admin-input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Started</span>
          <input
            name="started_at"
            type="date"
            required
            className="admin-input"
          />
        </label>
        <div className="flex items-end">
          <SubmitButton className="w-full" pendingLabel="Adding…">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add entry
          </SubmitButton>
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No entries yet"
          description="Add your first role above. Translations per language live inside each entry."
        />
      ) : (
        <form action={bulkUpdateWorkAction} className="flex flex-col gap-4">
          <ul className="flex list-none flex-col gap-3 p-0">
            {rows.map((row) => (
              <li key={row.id} className="admin-card flex flex-col gap-4 p-4">
                <input
                  type="hidden"
                  name={`work[${row.id}][__row]`}
                  value="1"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="admin-eyebrow">Company</span>
                    <input
                      name={`work[${row.id}][company]`}
                      defaultValue={row.company}
                      required
                      className="admin-input"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="admin-eyebrow">Role</span>
                    <input
                      name={`work[${row.id}][role]`}
                      defaultValue={row.role}
                      required
                      className="admin-input"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="admin-eyebrow">URL</span>
                    <input
                      name={`work[${row.id}][url]`}
                      defaultValue={row.url ?? ""}
                      placeholder="https://"
                      className="admin-input"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="admin-eyebrow">Location</span>
                    <input
                      name={`work[${row.id}][location]`}
                      defaultValue={row.location ?? ""}
                      className="admin-input"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="admin-eyebrow">Started</span>
                    <input
                      type="date"
                      name={`work[${row.id}][started_at]`}
                      defaultValue={row.started_at}
                      required
                      className="admin-input"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="admin-eyebrow">Ended</span>
                    <input
                      type="date"
                      name={`work[${row.id}][ended_at]`}
                      defaultValue={row.ended_at ?? ""}
                      className="admin-input"
                    />
                  </label>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    name={`work[${row.id}][is_current]`}
                    defaultChecked={row.is_current}
                    className="h-3.5 w-3.5 rounded accent-[var(--accent-blue)]"
                  />
                  <span>Current role (ignores end date)</span>
                </label>

                <details className="rounded-lg border border-dashed admin-divider bg-background/40 px-3 py-2">
                  <summary className="admin-eyebrow cursor-pointer">
                    Translations
                  </summary>
                  <div className="mt-3 flex flex-col gap-4">
                    {langs.map((l) => {
                      const i18n = i18nMap.get(`${row.id}::${l.id}`);
                      return (
                        <form
                          key={l.id}
                          action={upsertWorkI18nAction}
                          className="rounded-md border admin-divider bg-card p-3"
                        >
                          <input
                            type="hidden"
                            name="experience_id"
                            value={row.id}
                          />
                          <input
                            type="hidden"
                            name="language_id"
                            value={l.id}
                          />
                          <p className="admin-eyebrow mb-2">{l.code}</p>
                          <label className="flex flex-col gap-1.5">
                            <span className="admin-eyebrow">Summary</span>
                            <textarea
                              name="summary"
                              defaultValue={i18n?.summary ?? ""}
                              rows={2}
                              className="admin-input min-h-16 resize-y"
                            />
                          </label>
                          <label className="mt-2 flex flex-col gap-1.5">
                            <span className="admin-eyebrow">
                              Bullets (one per line)
                            </span>
                            <textarea
                              name="bullets"
                              defaultValue={(i18n?.bullets ?? []).join("\n")}
                              rows={4}
                              className="admin-input min-h-24 resize-y"
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

                <div className="flex items-center justify-end">
                  <DeleteButton
                    action={deleteWorkAction}
                    fieldValue={row.id}
                    label={`${row.role} @ ${row.company}`}
                    iconOnly
                  />
                </div>
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

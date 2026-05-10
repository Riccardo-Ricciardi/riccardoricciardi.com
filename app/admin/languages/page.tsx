import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  cloneLanguageAction,
  deleteLanguageAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { APP_CONFIG } from "@/utils/config/app";

export const dynamic = "force-dynamic";

interface Lang {
  id: number;
  code: string;
  name: string;
}

export default async function LanguagesAdmin() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("languages")
    .select("id, code, name")
    .order("id", { ascending: true });
  const langs = (data ?? []) as Lang[];
  const inApp = APP_CONFIG.languages as readonly string[];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Languages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Locales available across the site. Clone an existing one to bootstrap a new translation set.
        </p>
      </header>

      <section>
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {langs.length} active
        </h2>
        <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dashed border-dashed-soft text-left">
                <th className="w-24 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Code
                </th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Display name
                </th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Wired in code
                </th>
                <th className="w-20 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {langs.map((lang) => {
                const wired = inApp.includes(lang.code);
                return (
                  <tr
                    key={lang.id}
                    className="border-b border-dashed border-dashed-soft last:border-b-0"
                  >
                    <td className="px-3 py-2 font-mono text-sm">{lang.code}</td>
                    <td className="px-3 py-2">{lang.name}</td>
                    <td className="px-3 py-2 text-xs">
                      {wired ? (
                        <span className="text-accent-blue">✓ active</span>
                      ) : (
                        <span className="text-muted-foreground">
                          add to APP_CONFIG.languages
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <DeleteButton
                        action={deleteLanguageAction}
                        fieldName="id"
                        fieldValue={lang.id}
                        label={`language "${lang.code}"`}
                        description="Removes the language and all related translations (navbar, theme, etc)."
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section id="add" className="scroll-mt-24">
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Clone a language
        </h2>
        <form
          action={cloneLanguageAction}
          className="flex flex-col gap-3 rounded-lg border border-dashed border-dashed-soft p-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Source
              </span>
              <select
                name="source_code"
                defaultValue="en"
                className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {langs.map((l) => (
                  <option key={l.id} value={l.code}>
                    {l.code} — {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                New code
              </span>
              <input
                name="target_code"
                type="text"
                required
                placeholder="fr"
                className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 font-mono text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Display name
              </span>
              <input
                name="target_name"
                type="text"
                required
                placeholder="Français"
                className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
          <Button type="submit" className="w-full bg-accent-blue text-white">
            Clone
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Copies all navbar/theme/not_found rows from source. Add the new code to <code className="font-mono">APP_CONFIG.languages</code> to wire it.
          </p>
        </form>
      </section>
    </div>
  );
}

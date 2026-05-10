import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  cloneLanguageAction,
  deleteLanguageAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/utils/config/app";

export const dynamic = "force-dynamic";

interface Lang {
  id: number;
  code: string;
  name: string;
}

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LanguagesAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("languages")
    .select("id, code, name")
    .order("id", { ascending: true });
  const langs = (data ?? []) as Lang[];
  const inApp = APP_CONFIG.languages as readonly string[];

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Languages
        </h1>
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
          Clone language
        </h2>
        <form
          action={cloneLanguageAction}
          className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-dashed-soft p-4 sm:grid-cols-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Source
            </span>
            <select
              name="source_code"
              defaultValue="en"
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {langs.map((l) => (
                <option key={l.id} value={l.code}>
                  {l.code}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="New code (e.g. fr)"
            name="target_code"
            required
            placeholder="fr"
          />
          <Field
            label="Display name"
            name="target_name"
            required
            placeholder="Français"
          />
          <div className="self-end">
            <Button type="submit" className="bg-accent-blue text-white">
              Clone
            </Button>
          </div>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Clones all navbar/theme/not_found rows from source. After cloning, add
          the new code to APP_CONFIG.languages array in code and push.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {langs.length} language{langs.length === 1 ? "" : "s"}
        </h2>
        <ul className="flex flex-col gap-2 list-none p-0">
          {langs.map((lang) => {
            const inAppArray = inApp.includes(lang.code);
            return (
              <li
                key={lang.id}
                className="flex items-center justify-between rounded-xl border border-dashed border-dashed-soft p-4"
              >
                <div>
                  <p className="font-mono text-sm">
                    {lang.code} — {lang.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {inAppArray ? (
                      <span className="text-accent-blue">
                        ✓ Active in APP_CONFIG
                      </span>
                    ) : (
                      <span>Not yet in APP_CONFIG.languages — add in code</span>
                    )}
                  </p>
                </div>
                <form action={deleteLanguageAction}>
                  <input type="hidden" name="id" value={lang.id} />
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
            );
          })}
        </ul>
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
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
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

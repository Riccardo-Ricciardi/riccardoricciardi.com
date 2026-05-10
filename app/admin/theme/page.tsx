import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import { updateThemeAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ColorInput } from "@/components/admin/color-input";

export const dynamic = "force-dynamic";

interface Row {
  key: string;
  value_light: string;
  value_dark: string | null;
  type: "color" | "length" | "text" | "number";
  group_name: string;
  description: string | null;
  position: number;
}

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ThemeAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("theme_settings")
    .select("key, value_light, value_dark, type, group_name, description, position")
    .order("group_name", { ascending: true })
    .order("position", { ascending: true });

  const rows = (data ?? []) as Row[];
  const grouped = new Map<string, Row[]>();
  for (const r of rows) {
    const arr = grouped.get(r.group_name) ?? [];
    arr.push(r);
    grouped.set(r.group_name, arr);
  }

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Design system
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Theme</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Live tokens — overrides global CSS variables. Save to apply across the site.
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

      {Array.from(grouped.entries()).map(([group, items]) => (
        <section key={group}>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {group}
          </h2>
          <ul className="flex flex-col gap-2 list-none p-0">
            {items.map((row) => (
              <li
                key={row.key}
                className="rounded-xl border border-dashed border-dashed-soft p-4"
              >
                <form
                  action={updateThemeAction}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-7"
                >
                  <input type="hidden" name="key" value={row.key} />

                  <div className="sm:col-span-2">
                    <p className="font-mono text-sm">{row.key}</p>
                    {row.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.description}
                      </p>
                    )}
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {row.type}
                    </p>
                  </div>

                  <ValueField
                    label="Light"
                    name="value_light"
                    type={row.type}
                    defaultValue={row.value_light}
                    required
                  />
                  <ValueField
                    label="Dark"
                    name="value_dark"
                    type={row.type}
                    defaultValue={row.value_dark ?? ""}
                    placeholder="(falls back to light)"
                  />

                  <div className="flex items-end gap-2 sm:col-span-2">
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ValueField({
  label,
  name,
  type,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type: "color" | "length" | "text" | "number";
  defaultValue: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 sm:col-span-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {type === "color" ? (
        <ColorInput
          name={name}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
        />
      ) : (
        <input
          name={name}
          type="text"
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 font-mono text-xs focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )}
    </label>
  );
}

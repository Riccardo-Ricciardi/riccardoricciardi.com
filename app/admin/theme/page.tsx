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
  searchParams: Promise<{ error?: string; ok?: string }>;
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
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Design system
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Theme</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit colors, dimensions and visual tokens. Each row has independent Save.
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
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {group}
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {items.map((row) => (
              <form
                key={row.key}
                action={updateThemeAction}
                className="flex flex-col gap-3 rounded-lg border border-dashed border-dashed-soft p-4"
              >
                <input type="hidden" name="key" value={row.key} />
                <header>
                  <p className="font-mono text-sm">{row.key}</p>
                  {row.description && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {row.description}
                    </p>
                  )}
                </header>
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
                <Button type="submit" size="sm" variant="outline" className="self-end">
                  Save
                </Button>
              </form>
            ))}
          </div>
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
    <label className="flex flex-col gap-1">
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
          className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 font-mono text-xs focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )}
    </label>
  );
}

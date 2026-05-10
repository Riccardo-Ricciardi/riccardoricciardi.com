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
          Design tokens. Light + dark per row. Save independently.
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
          <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {group}
          </h2>
          <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-dashed border-dashed-soft text-left">
                  <Th>Token</Th>
                  <Th>Light</Th>
                  <Th>Dark</Th>
                  <Th className="w-16" />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-dashed border-dashed-soft last:border-b-0"
                  >
                    <td className="px-3 py-2 align-top">
                      <form action={updateThemeAction} id={`theme-${row.key}`}>
                        <input type="hidden" name="key" value={row.key} />
                      </form>
                      <p className="font-mono text-xs">{row.key}</p>
                      {row.description && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {row.description}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <ValueField
                        form={`theme-${row.key}`}
                        name="value_light"
                        type={row.type}
                        defaultValue={row.value_light}
                        required
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <ValueField
                        form={`theme-${row.key}`}
                        name="value_dark"
                        type={row.type}
                        defaultValue={row.value_dark ?? ""}
                        placeholder="falls back to light"
                      />
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <Button
                        type="submit"
                        form={`theme-${row.key}`}
                        size="sm"
                        variant="outline"
                      >
                        Save
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function ValueField({
  form,
  name,
  type,
  defaultValue,
  required,
  placeholder,
}: {
  form: string;
  name: string;
  type: "color" | "length" | "text" | "number";
  defaultValue: string;
  required?: boolean;
  placeholder?: string;
}) {
  if (type === "color") {
    return (
      <ColorInput
        form={form}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
      />
    );
  }
  return (
    <input
      form={form}
      name={name}
      type="text"
      defaultValue={defaultValue}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1.5 font-mono text-xs focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

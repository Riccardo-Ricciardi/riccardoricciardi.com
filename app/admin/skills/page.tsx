import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  createSkillAction,
  deleteSkillAction,
  updateSkillAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Row {
  id: number;
  name: string;
  position: number;
  percentage: number;
  dark: boolean;
  category: string | null;
}

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SkillsAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("id, name, position, percentage, dark, category")
    .order("position", { ascending: true });
  const rows = ((data ?? []) as Row[]) ?? [];

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Skills</h1>
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
          action={createSkillAction}
          className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-dashed-soft p-4 sm:grid-cols-6"
        >
          <Field label="Name" name="name" required className="sm:col-span-2" />
          <Field
            label="Position"
            name="position"
            type="number"
            defaultValue={rows.length.toString()}
          />
          <Field
            label="Percentage"
            name="percentage"
            type="number"
            min={0}
            max={100}
            defaultValue="80"
          />
          <Field label="Category" name="category" />
          <label className="flex items-center gap-2 self-end pb-2 sm:col-span-1">
            <input type="checkbox" name="dark" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Dark
            </span>
          </label>
          <div className="sm:col-span-6">
            <Button type="submit" className="bg-accent-blue text-white">
              Add skill
            </Button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {rows.length} item{rows.length === 1 ? "" : "s"}
        </h2>
        <ul className="flex flex-col gap-2 list-none p-0">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-dashed border-dashed-soft p-4"
            >
              <form
                action={updateSkillAction}
                className="grid grid-cols-1 gap-3 sm:grid-cols-7"
              >
                <input type="hidden" name="id" value={row.id} />
                <Field label="Name" name="name" defaultValue={row.name} required className="sm:col-span-2" />
                <Field
                  label="Position"
                  name="position"
                  type="number"
                  defaultValue={row.position.toString()}
                />
                <Field
                  label="%"
                  name="percentage"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={row.percentage.toString()}
                />
                <Field
                  label="Category"
                  name="category"
                  defaultValue={row.category ?? ""}
                />
                <label className="flex items-center gap-2 self-end pb-2">
                  <input type="checkbox" name="dark" defaultChecked={row.dark} />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Dark
                  </span>
                </label>
                <div className="flex items-end gap-2 sm:col-span-1">
                  <Button type="submit" size="sm" variant="outline">
                    Save
                  </Button>
                </div>
              </form>
              <form action={deleteSkillAction} className="mt-3 flex justify-end">
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
  min,
  max,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: number;
  max?: number;
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
        min={min}
        max={max}
        className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

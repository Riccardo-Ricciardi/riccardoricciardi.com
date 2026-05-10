import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  bulkUpdateSkillsAction,
  createSkillAction,
  deleteSkillAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Row {
  id: number;
  name: string;
  position: number | null;
  percentage: number | null;
  dark: boolean | null;
  category: string | null;
  icon_url: string | null;
  icon_dark_url: string | null;
}

interface PageProps {
  searchParams: Promise<{ error?: string; ok?: string }>;
}

export default async function SkillsAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error, ok } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("id, name, position, percentage, dark, category, icon_url, icon_dark_url")
    .order("position", { ascending: true });
  const rows = ((data ?? []) as Row[]) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Skills</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit any cell. Save all applies all changes at once.
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
      {ok && (
        <p
          role="status"
          className="rounded-md border border-dashed border-accent-blue bg-accent-blue-soft px-3 py-2 text-xs text-accent-blue"
        >
          Changes saved
        </p>
      )}

      {rows.length > 0 && (
        <form action={bulkUpdateSkillsAction} className="flex flex-col gap-3">
          <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-dashed border-dashed-soft text-left">
                  <Th>Icon</Th>
                  <Th>Name</Th>
                  <Th className="w-16">Pos</Th>
                  <Th className="w-16">%</Th>
                  <Th>Category</Th>
                  <Th className="w-16">Dark</Th>
                  <Th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-dashed border-dashed-soft last:border-b-0"
                  >
                    <td className="px-3 py-2">
                      <input
                        type="hidden"
                        name={`skill[${row.id}][__row]`}
                        value="1"
                      />
                      <Link
                        href={`/admin/skills/${row.id}`}
                        className="block"
                        title="Manage icons"
                      >
                        {row.icon_url ? (
                          <span className="relative inline-block h-7 w-7 rounded border border-dashed border-dashed-soft bg-background">
                            <Image
                              src={row.icon_url}
                              alt=""
                              fill
                              sizes="28px"
                              className="object-contain p-0.5"
                            />
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-accent-blue">
                            upload
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name={`skill[${row.id}][name]`}
                        defaultValue={row.name}
                        required
                        className="w-full rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name={`skill[${row.id}][position]`}
                        type="number"
                        defaultValue={(row.position ?? 0).toString()}
                        className="w-14 rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name={`skill[${row.id}][percentage]`}
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={(row.percentage ?? 0).toString()}
                        className="w-14 rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name={`skill[${row.id}][category]`}
                        defaultValue={row.category ?? ""}
                        className="w-full rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name={`skill[${row.id}][dark]`}
                        type="checkbox"
                        defaultChecked={row.dark ?? false}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="submit"
                        formAction={deleteSkillAction}
                        formNoValidate
                        name="id"
                        value={row.id}
                        className="font-mono text-[10px] uppercase tracking-wider text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button type="submit" className="w-full bg-accent-blue text-white">
            Save all
          </Button>
        </form>
      )}

      <section>
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Add new skill
        </h2>
        <form
          action={createSkillAction}
          className="grid grid-cols-2 items-end gap-2 rounded-lg border border-dashed border-dashed-soft p-3 sm:grid-cols-12"
        >
          <Field label="Name" name="name" required className="sm:col-span-3" />
          <Field
            label="Pos"
            name="position"
            type="number"
            defaultValue={rows.length.toString()}
            className="sm:col-span-1"
          />
          <Field
            label="%"
            name="percentage"
            type="number"
            min={0}
            max={100}
            defaultValue="80"
            className="sm:col-span-1"
          />
          <Field label="Category" name="category" className="sm:col-span-3" />
          <label className="flex items-center gap-2 self-end pb-1.5 sm:col-span-2">
            <input type="checkbox" name="dark" className="h-4 w-4" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Dark
            </span>
          </label>
          <Button
            type="submit"
            size="sm"
            className="bg-accent-blue text-white sm:col-span-2"
          >
            Add
          </Button>
        </form>
        <p className="mt-2 text-[11px] text-muted-foreground">
          After adding, click the icon column in the table to upload light + dark variants.
        </p>
      </section>
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
    <label className={`flex flex-col gap-1 ${className}`}>
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
        className="rounded-md border border-dashed border-dashed-soft bg-background px-2.5 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  bulkUpdateSkillsAction,
  createSkillAction,
  deleteSkillAction,
  moveSkillAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { SearchBox } from "@/components/admin/search-box";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL ?? "";

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
  searchParams: Promise<{ q?: string }>;
}

export default async function SkillsAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { q } = await searchParams;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("skills")
    .select("id, name, position, percentage, dark, category, icon_url, icon_dark_url")
    .order("position", { ascending: true });
  const allRows = ((data ?? []) as Row[]) ?? [];
  const query = (q ?? "").toLowerCase().trim();
  const rows = query
    ? allRows.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          (r.category ?? "").toLowerCase().includes(query)
      )
    : allRows;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Skills</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the arrows to reorder. Edit other fields and click Save all.
            {query && (
              <span className="ml-1 font-mono text-xs">
                — {rows.length}/{allRows.length} matching{" "}
                <span className="text-accent-blue">&quot;{query}&quot;</span>
              </span>
            )}
          </p>
        </div>
        <SearchBox placeholder="Search skills…" />
      </header>

      {rows.length > 0 && (
        <form action={bulkUpdateSkillsAction} className="flex flex-col gap-3">
          <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-dashed border-dashed-soft text-left">
                  <Th className="w-24">Order</Th>
                  <Th className="w-12">Icon</Th>
                  <Th>Name</Th>
                  <Th className="w-24">Level</Th>
                  <Th className="w-24">Dark icon</Th>
                  <Th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const iconSrc = row.icon_url ?? `${BASE_URL}/${row.name}.png`;
                  return (
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
                        <div className="flex items-center gap-1">
                          <span className="w-5 font-mono text-xs tabular-nums text-muted-foreground">
                            {index + 1}
                          </span>
                          <button
                            type="submit"
                            formAction={moveSkillAction}
                            formNoValidate
                            disabled={index === 0}
                            name={`move:${row.id}:up`}
                            value="1"
                            aria-label="Move up"
                            className="rounded p-0.5 text-muted-foreground hover:text-accent-blue disabled:opacity-30 disabled:hover:text-muted-foreground"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="submit"
                            formAction={moveSkillAction}
                            formNoValidate
                            disabled={index === rows.length - 1}
                            name={`move:${row.id}:down`}
                            value="1"
                            aria-label="Move down"
                            className="rounded p-0.5 text-muted-foreground hover:text-accent-blue disabled:opacity-30 disabled:hover:text-muted-foreground"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/skills/${row.id}`}
                          className="block"
                          title="Manage icons"
                        >
                          {iconSrc ? (
                            <span className="relative inline-block h-8 w-8 rounded border border-dashed border-dashed-soft bg-background">
                              <Image
                                src={iconSrc}
                                alt=""
                                fill
                                sizes="32px"
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
                          className="w-full rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative w-20">
                          <input
                            name={`skill[${row.id}][percentage]`}
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={(row.percentage ?? 0).toString()}
                            aria-label="Proficiency level 0-100"
                            className="w-full rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1.5 pr-6 text-sm tabular-nums focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
                            %
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="hidden"
                          name={`skill[${row.id}][category]`}
                          defaultValue={row.category ?? ""}
                        />
                        <Checkbox
                          name={`skill[${row.id}][dark]`}
                          defaultChecked={row.dark || !!row.icon_dark_url}
                          aria-label="Has dark icon variant"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <DeleteButton
                          action={deleteSkillAction}
                          fieldName="delete"
                          fieldValue={row.id}
                          label={`skill "${row.name}"`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <SubmitButton
            className="w-full bg-accent-blue text-white"
            pendingLabel="Saving…"
          >
            Save all
          </SubmitButton>
        </form>
      )}

      <section id="add" className="scroll-mt-24">
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Add new skill
        </h2>
        <form
          action={createSkillAction}
          className="grid grid-cols-2 items-end gap-2 rounded-lg border border-dashed border-dashed-soft p-3 sm:grid-cols-12"
        >
          <Field label="Name" name="name" required className="sm:col-span-4" />
          <Field
            label="Level (0-100)"
            name="percentage"
            type="number"
            min={0}
            max={100}
            defaultValue="80"
            className="sm:col-span-2"
          />
          <Field label="Category" name="category" className="sm:col-span-2" />
          <label className="flex items-center gap-2 self-end pb-2 sm:col-span-2">
            <Checkbox name="dark" aria-label="Has dark icon" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Dark icon
            </span>
          </label>
          <SubmitButton
            size="sm"
            className="bg-accent-blue text-white sm:col-span-2"
            pendingLabel="Adding…"
          >
            Add
          </SubmitButton>
        </form>
        <p className="mt-2 text-[11px] text-muted-foreground">
          New skill goes at the end. Click the icon column to upload light + dark variants.
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

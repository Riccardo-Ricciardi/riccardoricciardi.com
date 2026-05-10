import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  clearSkillIconAction,
  createSkillAction,
  deleteSkillAction,
  updateSkillAction,
  uploadSkillIconAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { FormField, FormToggle } from "@/components/admin/form-field";
import Image from "next/image";

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
  searchParams: Promise<{ error?: string }>;
}

export default async function SkillsAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error } = await searchParams;
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
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Add new
        </h2>
        <form
          action={createSkillAction}
          className="grid grid-cols-2 items-end gap-2 rounded-lg border border-dashed border-dashed-soft p-3 sm:grid-cols-12"
        >
          <FormField label="Name" name="name" required className="sm:col-span-3" />
          <FormField
            label="Pos"
            name="position"
            type="number"
            defaultValue={rows.length.toString()}
            className="sm:col-span-1"
          />
          <FormField
            label="%"
            name="percentage"
            type="number"
            min={0}
            max={100}
            defaultValue="80"
            className="sm:col-span-1"
          />
          <FormField label="Category" name="category" className="sm:col-span-3" />
          <FormToggle label="Dark" name="dark" className="sm:col-span-2" />
          <Button type="submit" size="sm" className="bg-accent-blue text-white sm:col-span-2">
            Add
          </Button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {rows.length} item{rows.length === 1 ? "" : "s"}
        </h2>
        <ul className="flex flex-col gap-2 list-none p-0">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-dashed border-dashed-soft p-3"
            >
              <form
                action={updateSkillAction}
                className="grid grid-cols-2 items-end gap-2 sm:grid-cols-12"
              >
                <input type="hidden" name="id" value={row.id} />
                <div className="flex items-center gap-2 sm:col-span-3">
                  {row.icon_url && (
                    <span className="relative h-7 w-7 shrink-0 rounded border border-dashed border-dashed-soft bg-background">
                      <Image
                        src={row.icon_url}
                        alt=""
                        fill
                        sizes="28px"
                        className="object-contain p-0.5"
                      />
                    </span>
                  )}
                  <FormField label="Name" name="name" defaultValue={row.name} required className="flex-1" />
                </div>
                <FormField
                  label="Pos"
                  name="position"
                  type="number"
                  defaultValue={(row.position ?? 0).toString()}
                  className="sm:col-span-1"
                />
                <FormField
                  label="%"
                  name="percentage"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={(row.percentage ?? 0).toString()}
                  className="sm:col-span-1"
                />
                <FormField
                  label="Category"
                  name="category"
                  defaultValue={row.category ?? ""}
                  className="sm:col-span-3"
                />
                <FormToggle
                  label="Dark"
                  name="dark"
                  defaultChecked={row.dark ?? false}
                  className="sm:col-span-2"
                />
                <Button type="submit" size="sm" variant="outline" className="sm:col-span-2">
                  Save
                </Button>
              </form>

              <details className="mt-2">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  Icons + delete
                </summary>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <IconSlot rowId={row.id} variant="light" url={row.icon_url} fallbackName={row.name} />
                  <IconSlot rowId={row.id} variant="dark" url={row.icon_dark_url} fallbackName={row.name} />
                </div>
              </details>

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

function IconSlot({
  rowId,
  variant,
  url,
  fallbackName,
}: {
  rowId: number;
  variant: "light" | "dark";
  url: string | null;
  fallbackName: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-dashed-soft p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Icon — {variant}
        </span>
        {url && (
          <form action={clearSkillIconAction}>
            <input type="hidden" name="id" value={rowId} />
            <input type="hidden" name="variant" value={variant} />
            <button
              type="submit"
              className="font-mono text-[10px] uppercase tracking-wider text-red-600 hover:underline"
            >
              Remove
            </button>
          </form>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`relative h-9 w-9 shrink-0 rounded-md border border-dashed border-dashed-soft ${
            variant === "dark" ? "bg-foreground/90" : "bg-background"
          }`}
        >
          {url ? (
            <Image
              src={url}
              alt={`${fallbackName} ${variant}`}
              fill
              sizes="36px"
              className="object-contain p-0.5"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
              ?
            </span>
          )}
        </div>
        <form
          action={uploadSkillIconAction}
          encType="multipart/form-data"
          className="flex flex-1 items-center gap-2"
        >
          <input type="hidden" name="id" value={rowId} />
          <input type="hidden" name="variant" value={variant} />
          <input
            type="file"
            name="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml,image/gif"
            required
            className="flex-1 text-xs file:mr-2 file:rounded file:border file:border-dashed file:border-dashed-soft file:bg-background file:px-2 file:py-0.5 file:text-[10px] hover:file:border-accent-blue"
          />
          <Button type="submit" size="sm" variant="outline">
            Upload
          </Button>
        </form>
      </div>
    </div>
  );
}

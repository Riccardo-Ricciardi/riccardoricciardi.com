import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  clearSkillIconAction,
  deleteSkillAction,
  updateSkillAction,
  uploadSkillIconAction,
} from "@/app/admin/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/submit-button";

export const dynamic = "force-dynamic";

interface Skill {
  id: number;
  name: string;
  position: number | null;
  percentage: number | null;
  category: string | null;
  icon_url: string | null;
  icon_dark_url: string | null;
  dark: boolean | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SkillDetailAdmin({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("skills")
    .select(
      "id, name, position, percentage, category, icon_url, icon_dark_url, dark"
    )
    .eq("id", Number(id))
    .maybeSingle();

  const skill = data as Skill | null;

  if (!skill) {
    return (
      <div className="flex flex-col gap-4">
        <p>Skill not found.</p>
        <Link
          href="/admin/skills"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent-blue"
        >
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link
          href="/admin/skills"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent-blue"
        >
          ← Skills
        </Link>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {skill.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit metadata and upload light + dark icon variants.
        </p>
      </header>

      <section className="rounded-xl border border-dashed border-dashed-soft p-4">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Metadata
        </h2>
        <form
          action={updateSkillAction}
          className="grid gap-3 sm:grid-cols-12"
        >
          <input type="hidden" name="id" value={skill.id} />
          <input type="hidden" name="position" value={skill.position ?? 0} />
          <DetailField
            label="Name"
            name="name"
            defaultValue={skill.name}
            required
            className="sm:col-span-5"
          />
          <DetailField
            label="Level (0-100)"
            name="percentage"
            type="number"
            min={0}
            max={100}
            defaultValue={String(skill.percentage ?? 0)}
            className="sm:col-span-3"
          />
          <DetailField
            label="Category"
            name="category"
            defaultValue={skill.category ?? ""}
            className="sm:col-span-3"
          />
          <label className="flex items-center gap-2 self-end pb-2 sm:col-span-1">
            <Checkbox
              name="dark"
              defaultChecked={skill.dark ?? false}
              aria-label="Has dark icon variant"
            />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Dark
            </span>
          </label>
          <SubmitButton
            size="sm"
            className="bg-accent-blue text-white sm:col-span-12"
            pendingLabel="Saving…"
          >
            Save metadata
          </SubmitButton>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Icons
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <IconSlot
            rowId={skill.id}
            variant="light"
            url={skill.icon_url}
            fallbackName={skill.name}
          />
          <IconSlot
            rowId={skill.id}
            variant="dark"
            url={skill.icon_dark_url}
            fallbackName={skill.name}
          />
        </div>
      </section>

      <section className="flex items-center justify-between rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-4">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-red-700 dark:text-red-300">
            Danger zone
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Deleting removes the row and both icons. Cannot be undone.
          </p>
        </div>
        <DeleteButton
          action={deleteSkillAction}
          fieldName="delete"
          fieldValue={skill.id}
          label={`skill "${skill.name}"`}
        />
      </section>
    </div>
  );
}

function DetailField({
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
    <div className="rounded-lg border border-dashed border-dashed-soft p-4">
      <div className="mb-3 flex items-center justify-between">
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
      <div className="flex items-center gap-3">
        <div
          className={`relative h-14 w-14 shrink-0 rounded-md border border-dashed border-dashed-soft ${
            variant === "dark" ? "bg-foreground/90" : "bg-background"
          }`}
        >
          {url ? (
            <Image
              src={url}
              alt={`${fallbackName} ${variant}`}
              fill
              sizes="56px"
              className="object-contain p-1"
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
          className="flex flex-1 flex-col gap-2"
        >
          <input type="hidden" name="id" value={rowId} />
          <input type="hidden" name="variant" value={variant} />
          <input
            type="file"
            name="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml,image/gif"
            required
            className="text-xs file:mr-2 file:rounded-md file:border file:border-dashed file:border-dashed-soft file:bg-background file:px-2 file:py-1 file:text-xs file:font-medium hover:file:border-accent-blue"
          />
          <SubmitButton
            size="sm"
            variant="outline"
            className="self-start"
            pendingLabel="Uploading…"
          >
            Upload
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

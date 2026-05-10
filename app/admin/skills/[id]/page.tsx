import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  clearSkillIconAction,
  uploadSkillIconAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Skill {
  id: number;
  name: string;
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
  const supabase = await createClient();

  const { data } = await supabase
    .from("skills")
    .select("id, name, icon_url, icon_dark_url, dark")
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
          Icons
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {skill.name}
        </h1>
      </header>

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
          <Button type="submit" size="sm" variant="outline" className="self-start">
            Upload
          </Button>
        </form>
      </div>
    </div>
  );
}

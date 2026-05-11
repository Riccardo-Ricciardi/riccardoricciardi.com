import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import {
  clearSkillIconAction,
  uploadSkillIconAction,
} from "@/app/admin/_actions/skills";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SkillDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const skillId = Number(id);
  if (!Number.isFinite(skillId) || skillId <= 0) notFound();

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("skills")
    .select("id, name, icon_url, icon_dark_url, dark, percentage")
    .eq("id", skillId)
    .maybeSingle();
  const skill = data as
    | {
        id: number;
        name: string;
        icon_url: string | null;
        icon_dark_url: string | null;
        dark: boolean | null;
        percentage: number | null;
      }
    | null;
  if (!skill) notFound();

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/skills"
        className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        Back to skills
      </Link>

      <SectionHeader
        eyebrow="Skill"
        title={skill.name}
        description={`Proficiency ${skill.percentage ?? 0}%`}
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <IconSlot
          title="Light variant"
          description="Shown on the public site in light theme."
          variant="light"
          url={skill.icon_url}
          id={skill.id}
          name={skill.name}
        />
        <IconSlot
          title="Dark variant"
          description="Optional. Only shown when dark mode is active."
          variant="dark"
          url={skill.icon_dark_url}
          id={skill.id}
          name={skill.name}
        />
      </section>
    </div>
  );
}

function IconSlot({
  title,
  description,
  variant,
  url,
  id,
  name,
}: {
  title: string;
  description: string;
  variant: "light" | "dark";
  url: string | null;
  id: number;
  name: string;
}) {
  return (
    <div className="admin-card flex flex-col gap-3 p-5">
      <div>
        <p className="admin-eyebrow">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      <div
        className={`relative flex h-32 items-center justify-center rounded-lg border border-dashed admin-divider ${
          variant === "dark"
            ? "bg-neutral-900"
            : "bg-[color-mix(in_oklab,var(--background)_70%,white)]"
        }`}
      >
        {url ? (
          <Image
            src={url}
            alt={`${name} ${variant} icon`}
            width={80}
            height={80}
            sizes="80px"
            className="h-20 w-20 object-contain"
            unoptimized
          />
        ) : (
          <p className="text-xs text-muted-foreground">No icon uploaded</p>
        )}
      </div>

      <form
        action={uploadSkillIconAction}
        encType="multipart/form-data"
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="variant" value={variant} />
        <input
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
          required
          className="block w-full cursor-pointer text-xs file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-xs file:font-medium hover:file:bg-accent/80"
        />
        <SubmitButton pendingLabel="Uploading…">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          Upload {variant}
        </SubmitButton>
      </form>

      {url && (
        <form action={clearSkillIconAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="variant" value={variant} />
          <SubmitButton
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-rose-500"
            pendingLabel="Removing…"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Remove icon
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2, Upload } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import {
  clearProjectScreenshotAction,
  upsertProjectI18nAction,
  uploadProjectScreenshotAction,
} from "@/app/admin/_actions/projects";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  if (!id) notFound();

  const supabase = createAdminClient();
  const [{ data: projectData }, { data: langsData }, { data: i18nData }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, repo, name, description, url, homepage, language, stars, screenshot_url, og_image"
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("languages")
        .select("id, code, name")
        .order("id", { ascending: true }),
      supabase
        .from("projects_i18n")
        .select("language_id, description")
        .eq("project_id", id),
    ]);

  const project = projectData as
    | {
        id: string;
        repo: string;
        name: string | null;
        description: string | null;
        url: string | null;
        homepage: string | null;
        language: string | null;
        stars: number | null;
        screenshot_url: string | null;
        og_image: string | null;
      }
    | null;
  if (!project) notFound();

  const langs = (langsData ?? []) as Array<{
    id: number;
    code: string;
    name: string;
  }>;
  const i18nByLang = new Map<number, string>();
  for (const r of (i18nData ?? []) as Array<{
    language_id: number;
    description: string | null;
  }>) {
    if (r.description) i18nByLang.set(r.language_id, r.description);
  }

  const imgSrc =
    project.screenshot_url ||
    project.og_image ||
    `https://opengraph.githubassets.com/1/${project.repo}`;

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/projects"
        className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        Back to projects
      </Link>

      <SectionHeader
        eyebrow={project.language ?? "Project"}
        title={project.name ?? project.repo}
        description={project.repo}
        actions={
          project.url && (
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-button admin-button-ghost"
            >
              View on GitHub
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="admin-card overflow-hidden">
          <div className="relative aspect-[16/9] w-full bg-muted/30">
            <Image
              src={imgSrc}
              alt={project.repo}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="space-y-3 p-4">
            <form
              action={uploadProjectScreenshotAction}
              encType="multipart/form-data"
              className="flex flex-col gap-2"
            >
              <input type="hidden" name="id" value={project.id} />
              <label className="admin-eyebrow">Replace screenshot</label>
              <input
                type="file"
                name="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                required
                className="block w-full cursor-pointer text-xs file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-xs file:font-medium hover:file:bg-accent/80"
              />
              <SubmitButton pendingLabel="Uploading…">
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                Upload
              </SubmitButton>
            </form>

            {project.screenshot_url && (
              <form action={clearProjectScreenshotAction}>
                <input type="hidden" name="id" value={project.id} />
                <SubmitButton
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground hover:text-rose-500"
                  pendingLabel="Removing…"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  Remove screenshot (falls back to OG image)
                </SubmitButton>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="admin-eyebrow">Default description</p>
            <p className="mt-2 rounded-md border admin-divider bg-background/50 p-3 text-sm text-muted-foreground">
              {project.description ?? "—"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Synced from GitHub. Override per language below.
            </p>
          </div>

          {langs.map((lang) => (
            <form
              key={lang.id}
              action={upsertProjectI18nAction}
              className="admin-card flex flex-col gap-2 p-3"
            >
              <input type="hidden" name="project_id" value={project.id} />
              <input type="hidden" name="language_id" value={lang.id} />
              <div className="flex items-center justify-between">
                <span className="admin-eyebrow">
                  {lang.code} · {lang.name}
                </span>
              </div>
              <textarea
                name="description"
                rows={3}
                defaultValue={i18nByLang.get(lang.id) ?? ""}
                placeholder={project.description ?? "Translated description…"}
                className="admin-input min-h-20"
              />
              <SubmitButton pendingLabel="Saving…">Save {lang.code}</SubmitButton>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2, Upload } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { logger } from "@/utils/logger";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import {
  clearProjectScreenshotAction,
  updateProjectDetailsAction,
  updateProjectNarrativeAction,
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
  const [
    { data: projectData, error: projectErr },
    { data: langsData, error: langsErr },
    { data: i18nData, error: i18nErr },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, repo, name, description, url, homepage, language, stars, screenshot_url, og_image, problem, solution, outcome, kind, status, surface, telemetry, featured, slug"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase
      .from("projects_i18n")
      .select(
        "language_id, description, one_liner, problem, solution, outcome, metrics"
      )
      .eq("project_id", id),
  ]);

  if (projectErr) {
    logger.error("admin/projects/[id]: project fetch failed", {
      id,
      message: projectErr.message,
    });
  }
  if (langsErr) {
    logger.error("admin/projects/[id]: languages fetch failed", {
      message: langsErr.message,
    });
  }
  if (i18nErr) {
    logger.error("admin/projects/[id]: i18n fetch failed", {
      id,
      message: i18nErr.message,
    });
  }

  const project = projectData as
    | {
        id: string;
        repo: string | null;
        name: string | null;
        description: string | null;
        url: string | null;
        homepage: string | null;
        language: string | null;
        stars: number | null;
        screenshot_url: string | null;
        og_image: string | null;
        problem: string | null;
        solution: string | null;
        outcome: string | null;
        kind: string;
        status: string | null;
        surface: string | null;
        telemetry: string | null;
        featured: boolean;
        slug: string | null;
      }
    | null;
  if (!project) notFound();

  const langs = (langsData ?? []) as Array<{
    id: number;
    code: string;
    name: string;
  }>;
  type I18nRow = {
    language_id: number;
    description: string | null;
    one_liner: string | null;
    problem: string | null;
    solution: string | null;
    outcome: string | null;
    metrics: string[];
  };
  const i18nByLang = new Map<number, I18nRow>();
  for (const r of (i18nData ?? []) as I18nRow[]) {
    i18nByLang.set(r.language_id, r);
  }

  const title = project.name ?? project.repo ?? project.slug ?? "Project";
  const imgSrc =
    project.screenshot_url ||
    project.og_image ||
    (project.repo
      ? `https://opengraph.githubassets.com/1/${project.repo}`
      : null);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/projects"
        className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        Back to projects
      </Link>

      <SectionHeader
        eyebrow={project.language ?? "Project"}
        title={title}
        description={project.repo ?? project.slug ?? undefined}
        actions={
          project.url && (
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-button admin-button-ghost"
            >
              View on GitHub
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          )
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="admin-card overflow-hidden">
          <div className="relative aspect-[16/9] w-full bg-muted/30">
            {imgSrc && (
              <Image
                src={imgSrc}
                alt={title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            )}
          </div>
          <div className="space-y-3 p-4">
            <form
              action={uploadProjectScreenshotAction}
              encType="multipart/form-data"
              className="flex flex-col gap-2"
            >
              <input type="hidden" name="id" value={project.id} />
              <label className="admin-eyebrow" htmlFor={`screenshot-${project.id}`}>
                Replace screenshot
              </label>
              <input
                id={`screenshot-${project.id}`}
                type="file"
                name="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                required
                className="admin-file"
              />
              <SubmitButton pendingLabel="Uploading…">
                <Upload className="size-3.5" aria-hidden="true" />
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
                  <Trash2 className="size-3" aria-hidden="true" />
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

          {langs.map((lang) => {
            const row = i18nByLang.get(lang.id);
            return (
              <form
                key={lang.id}
                action={upsertProjectI18nAction}
                className="admin-card flex flex-col gap-3 p-3"
              >
                <input type="hidden" name="project_id" value={project.id} />
                <input type="hidden" name="language_id" value={lang.id} />
                <div className="flex items-center justify-between">
                  <span className="admin-eyebrow">
                    {lang.code} · {lang.name}
                  </span>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="admin-eyebrow">Description</span>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={row?.description ?? ""}
                    placeholder={project.description ?? "Translated description…"}
                    className="admin-input min-h-20"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="admin-eyebrow">One liner</span>
                  <input
                    name="one_liner"
                    defaultValue={row?.one_liner ?? ""}
                    placeholder="One sentence pitch…"
                    className="admin-input"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="admin-eyebrow">Metrics (one per line)</span>
                  <textarea
                    name="metrics"
                    rows={3}
                    defaultValue={(row?.metrics ?? []).join("\n")}
                    placeholder={"99.9% uptime\n3x faster builds"}
                    className="admin-input min-h-20"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="admin-eyebrow">Problem</span>
                  <textarea
                    name="problem"
                    rows={2}
                    defaultValue={row?.problem ?? ""}
                    placeholder={
                      project.problem ?? "What problem this project solves…"
                    }
                    className="admin-input min-h-16"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="admin-eyebrow">Solution</span>
                  <textarea
                    name="solution"
                    rows={2}
                    defaultValue={row?.solution ?? ""}
                    placeholder={
                      project.solution ?? "How the project tackles it…"
                    }
                    className="admin-input min-h-16"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="admin-eyebrow">Outcome</span>
                  <textarea
                    name="outcome"
                    rows={2}
                    defaultValue={row?.outcome ?? ""}
                    placeholder={
                      project.outcome ?? "Result, metric, or impact…"
                    }
                    className="admin-input min-h-16"
                  />
                </label>
                <SubmitButton pendingLabel="Saving…">
                  Save {lang.code}
                </SubmitButton>
              </form>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <header>
          <p className="admin-eyebrow">Details</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Kind drives validation: repo projects need owner/name, case
            studies need a slug.
          </p>
        </header>
        <form
          action={updateProjectDetailsAction}
          className="admin-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input type="hidden" name="id" value={project.id} />
          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Kind</span>
            <select
              name="kind"
              defaultValue={project.kind}
              className="admin-input"
            >
              <option value="repo">Repo</option>
              <option value="case_study">Case study</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Status</span>
            <select
              name="status"
              defaultValue={project.status ?? "none"}
              className="admin-input"
            >
              <option value="none">None</option>
              <option value="live">Live</option>
              <option value="shipped">Shipped</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Repo (owner/name)</span>
            <input
              name="repo"
              defaultValue={project.repo ?? ""}
              placeholder="owner/name"
              className="admin-input"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Slug (kebab-case)</span>
            <input
              name="slug"
              defaultValue={project.slug ?? ""}
              placeholder="client-dashboard"
              className="admin-input"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Surface</span>
            <input
              name="surface"
              defaultValue={project.surface ?? ""}
              placeholder="Web app, CLI, iOS…"
              className="admin-input"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Telemetry</span>
            <input
              name="telemetry"
              defaultValue={project.telemetry ?? ""}
              placeholder="42 users · 9k requests/mo"
              className="admin-input"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={project.featured}
              className="size-3.5 rounded accent-[var(--accent-blue)]"
            />
            <span>Featured on the work page</span>
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <SubmitButton pendingLabel="Saving…">Save details</SubmitButton>
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <header>
          <p className="admin-eyebrow">Narrative · default</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Used as the base narrative for every language. Override per
            language in the cards above.
          </p>
        </header>
        <form
          action={updateProjectNarrativeAction}
          className="admin-card grid gap-3 p-4 lg:grid-cols-3"
        >
          <input type="hidden" name="id" value={project.id} />
          <label className="flex flex-col gap-1">
            <span className="admin-eyebrow">Problem</span>
            <textarea
              name="problem"
              rows={3}
              defaultValue={project.problem ?? ""}
              placeholder="What problem this project solves…"
              className="admin-input min-h-24"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="admin-eyebrow">Solution</span>
            <textarea
              name="solution"
              rows={3}
              defaultValue={project.solution ?? ""}
              placeholder="How the project tackles it…"
              className="admin-input min-h-24"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="admin-eyebrow">Outcome</span>
            <textarea
              name="outcome"
              rows={3}
              defaultValue={project.outcome ?? ""}
              placeholder="Result, metric, or impact…"
              className="admin-input min-h-24"
            />
          </label>
          <div className="lg:col-span-3">
            <SubmitButton pendingLabel="Saving…">Save narrative</SubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  clearProjectScreenshotAction,
  upsertProjectI18nAction,
  uploadProjectScreenshotAction,
} from "@/app/admin/actions";
import { LangTabs } from "@/components/admin/lang-tabs";
import { SubmitButton } from "@/components/admin/submit-button";

export const dynamic = "force-dynamic";

interface Project {
  id: string;
  repo: string;
  name: string | null;
  description: string | null;
  og_image: string | null;
  screenshot_url: string | null;
  url: string | null;
  homepage: string | null;
  stars: number | null;
  forks: number | null;
  language: string | null;
  topics: string[] | null;
  pushed_at: string | null;
  synced_at: string | null;
  visible: boolean | null;
}

interface Lang {
  id: number;
  code: string;
  name: string;
}

interface I18nRow {
  language_id: number;
  description: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectI18nAdmin({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: project }, { data: languages }, { data: i18nRows }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, repo, name, description, og_image, screenshot_url, url, homepage, stars, forks, language, topics, pushed_at, synced_at, visible"
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

  if (!project) {
    return (
      <div>
        <p>Project not found.</p>
        <Link href="/admin/projects" className="hover:text-accent-blue">
          ← Back
        </Link>
      </div>
    );
  }

  const p = project as Project;
  const langs = (languages ?? []) as Lang[];
  const overrides = new Map<number, string>(
    ((i18nRows ?? []) as I18nRow[]).map((r) => [r.language_id, r.description ?? ""])
  );

  const githubUrl = p.url ?? `https://github.com/${p.repo}`;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link
          href="/admin/projects"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent-blue"
        >
          ← Projects
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Catalog · {p.visible ? "Visible" : "Hidden"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {p.name ?? p.repo}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {p.repo}
            </p>
          </div>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-md border border-dashed border-dashed-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent-blue hover:text-accent-blue"
          >
            View on GitHub
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
        {p.description && (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-mono text-[10px] uppercase tracking-wider">
              Default
            </span>
            {" — "}
            {p.description}
          </p>
        )}
      </header>

      <section>
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          GitHub metadata
        </h2>
        <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-xs sm:grid-cols-4">
            <Stat label="Stars" value={p.stars != null ? `★ ${p.stars}` : "—"} />
            <Stat label="Forks" value={p.forks != null ? String(p.forks) : "—"} />
            <Stat label="Language" value={p.language ?? "—"} />
            <Stat
              label="Homepage"
              value={
                p.homepage ? (
                  <a
                    href={p.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-accent-blue hover:underline"
                  >
                    {p.homepage.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Stat
              label="Pushed"
              value={p.pushed_at ? formatRel(p.pushed_at) : "—"}
            />
            <Stat
              label="Synced"
              value={p.synced_at ? formatRel(p.synced_at) : "—"}
            />
            <Stat
              label="Topics"
              value={
                p.topics && p.topics.length > 0 ? (
                  <span className="flex flex-wrap gap-1">
                    {p.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-dashed border-dashed-soft px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                ) : (
                  "—"
                )
              }
              className="sm:col-span-2"
            />
          </dl>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Synced from GitHub via the cron job. To refresh, hit Sync GitHub on the projects list.
        </p>
      </section>

      <section className="rounded-xl border border-dashed border-dashed-soft p-4">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Card image
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-dashed border-dashed-soft bg-muted/30 sm:w-64">
            <Image
              src={
                p.screenshot_url ||
                p.og_image ||
                `https://opengraph.githubassets.com/1/${p.repo}`
              }
              alt={p.repo}
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Default uses GitHub OG. Upload custom screenshot to override.
            </p>
            <form
              action={uploadProjectScreenshotAction}
              encType="multipart/form-data"
              className="flex flex-col gap-2"
            >
              <input type="hidden" name="id" value={p.id} />
              <input
                type="file"
                name="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                required
                className="text-xs file:mr-2 file:rounded-md file:border file:border-dashed file:border-dashed-soft file:bg-background file:px-2 file:py-1 file:text-xs file:font-medium hover:file:border-accent-blue"
              />
              <SubmitButton
                size="sm"
                variant="outline"
                className="self-start"
                pendingLabel="Uploading…"
              >
                Upload screenshot
              </SubmitButton>
            </form>
            {p.screenshot_url && (
              <form action={clearProjectScreenshotAction}>
                <input type="hidden" name="id" value={p.id} />
                <SubmitButton
                  size="sm"
                  variant="outline"
                  className="self-start border-red-500/40 text-red-600 hover:bg-red-500/5 hover:text-red-700"
                  pendingLabel="Removing…"
                >
                  Remove custom screenshot
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Description per language
        </h2>
        <LangTabs
          storageKey="admin.lang"
          langs={langs}
          panels={langs.map((lang) => (
            <form
              key={lang.id}
              action={upsertProjectI18nAction}
              className="flex flex-col gap-2"
            >
              <input type="hidden" name="project_id" value={p.id} />
              <input type="hidden" name="language_id" value={lang.id} />
              <textarea
                name="description"
                defaultValue={overrides.get(lang.id) ?? ""}
                rows={4}
                placeholder={`Localized description for ${lang.code} (leave empty to use default)`}
                className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <SubmitButton
                size="sm"
                variant="outline"
                className="self-start"
                pendingLabel="Saving…"
              >
                Save
              </SubmitButton>
            </form>
          ))}
        />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-xs">{value}</dd>
    </div>
  );
}

function formatRel(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Math.max(0, Date.now() - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}

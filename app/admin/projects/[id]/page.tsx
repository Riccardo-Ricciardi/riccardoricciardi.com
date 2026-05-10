import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  clearProjectScreenshotAction,
  upsertProjectI18nAction,
  uploadProjectScreenshotAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Project {
  id: string;
  repo: string;
  name: string | null;
  description: string | null;
  og_image: string | null;
  screenshot_url: string | null;
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
  const supabase = await createClient();

  const [{ data: project }, { data: languages }, { data: i18nRows }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, repo, name, description, og_image, screenshot_url")
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

  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link
          href="/admin/projects"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent-blue"
        >
          ← Projects
        </Link>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Translations
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{p.repo}</h1>
        {p.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-mono text-[10px] uppercase tracking-wider">
              Default
            </span>
            {" — "}
            {p.description}
          </p>
        )}
      </header>

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
              <Button type="submit" size="sm" variant="outline" className="self-start">
                Upload screenshot
              </Button>
            </form>
            {p.screenshot_url && (
              <form action={clearProjectScreenshotAction}>
                <input type="hidden" name="id" value={p.id} />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="self-start border-red-500/40 text-red-600 hover:bg-red-500/5 hover:text-red-700"
                >
                  Remove custom screenshot
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        {langs.map((lang) => (
          <form
            key={lang.id}
            action={upsertProjectI18nAction}
            className="flex flex-col gap-2 rounded-xl border border-dashed border-dashed-soft p-4"
          >
            <input type="hidden" name="project_id" value={p.id} />
            <input type="hidden" name="language_id" value={lang.id} />
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {lang.code} — {lang.name}
              </span>
              <Button type="submit" size="sm" variant="outline">
                Save
              </Button>
            </div>
            <textarea
              name="description"
              defaultValue={overrides.get(lang.id) ?? ""}
              rows={3}
              placeholder={`Localized description for ${lang.code} (leave empty to use default)`}
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
        ))}
      </section>
    </div>
  );
}

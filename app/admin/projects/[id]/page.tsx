import Link from "next/link";
import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import { upsertProjectI18nAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Project {
  id: string;
  repo: string;
  name: string | null;
  description: string | null;
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
        .select("id, repo, name, description")
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

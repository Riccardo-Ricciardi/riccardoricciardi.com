import Link from "next/link";
import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  createProjectAction,
  deleteProjectAction,
  triggerSyncAction,
  updateProjectAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { FormField, FormToggle } from "@/components/admin/form-field";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  repo: string;
  name: string | null;
  position: number | null;
  visible: boolean | null;
  stars: number | null;
  language: string | null;
  synced_at: string | null;
}

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ProjectsAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, repo, name, position, visible, stars, language, synced_at")
    .order("position", { ascending: true });
  const rows = ((data ?? []) as Row[]) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Content
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Projects
          </h1>
        </div>
        <form action={triggerSyncAction}>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="hover:border-accent-blue hover:text-accent-blue"
          >
            Sync GitHub
          </Button>
        </form>
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
          action={createProjectAction}
          className="grid grid-cols-2 items-end gap-2 rounded-lg border border-dashed border-dashed-soft p-3 sm:grid-cols-12"
        >
          <FormField
            label="Repo (owner/name)"
            name="repo"
            required
            placeholder="Riccardo-Ricciardi/repo-name"
            className="sm:col-span-7"
          />
          <FormField
            label="Pos"
            name="position"
            type="number"
            defaultValue={rows.length.toString()}
            className="sm:col-span-1"
          />
          <FormToggle label="Visible" name="visible" defaultChecked className="sm:col-span-2" />
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
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-medium">
                    {row.repo}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {row.name ?? "—"} · {row.language ?? "—"} · ★{row.stars ?? 0}
                  </p>
                </div>
                <Link
                  href={`/admin/projects/${row.id}`}
                  className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-accent-blue"
                >
                  Translations →
                </Link>
              </div>
              <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-12">
                <form
                  action={updateProjectAction}
                  className="contents"
                  id={`update-${row.id}`}
                >
                  <input type="hidden" name="id" value={row.id} />
                  <FormField
                    label="Pos"
                    name="position"
                    type="number"
                    defaultValue={(row.position ?? 0).toString()}
                    className="sm:col-span-2"
                  />
                  <FormToggle
                    label="Visible"
                    name="visible"
                    defaultChecked={row.visible ?? false}
                    className="sm:col-span-2"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="sm:col-span-2"
                  >
                    Save
                  </Button>
                </form>
                <form
                  action={deleteProjectAction}
                  className="sm:col-span-2"
                >
                  <input type="hidden" name="id" value={row.id} />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="w-full border-red-500/40 text-red-600 hover:bg-red-500/5 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

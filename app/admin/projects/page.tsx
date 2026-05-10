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

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  repo: string;
  name: string | null;
  position: number;
  visible: boolean;
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
    <div className="flex flex-col gap-10">
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
            Sync from GitHub
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
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Add new
        </h2>
        <form
          action={createProjectAction}
          className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-dashed-soft p-4 sm:grid-cols-5"
        >
          <Field
            label="Repo (owner/name)"
            name="repo"
            required
            placeholder="Riccardo-Ricciardi/repo-name"
            className="sm:col-span-3"
          />
          <Field
            label="Position"
            name="position"
            type="number"
            defaultValue={rows.length.toString()}
          />
          <label className="flex items-center gap-2 self-end pb-2">
            <input type="checkbox" name="visible" defaultChecked />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Visible
            </span>
          </label>
          <div className="sm:col-span-5">
            <Button type="submit" className="bg-accent-blue text-white">
              Add project
            </Button>
          </div>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          After adding, click "Sync from GitHub" to pull metadata.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {rows.length} item{rows.length === 1 ? "" : "s"}
        </h2>
        <ul className="flex flex-col gap-2 list-none p-0">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-dashed border-dashed-soft p-4"
            >
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-medium">{row.repo}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.name ?? "—"} · {row.language ?? "—"} · ★{row.stars ?? 0}
                  </p>
                </div>
                <Link
                  href={`/admin/projects/${row.id}`}
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent-blue"
                >
                  Translations →
                </Link>
              </div>
              <form
                action={updateProjectAction}
                className="grid grid-cols-1 gap-3 sm:grid-cols-4"
              >
                <input type="hidden" name="id" value={row.id} />
                <Field
                  label="Position"
                  name="position"
                  type="number"
                  defaultValue={row.position.toString()}
                />
                <label className="flex items-center gap-2 self-end pb-2">
                  <input
                    type="checkbox"
                    name="visible"
                    defaultChecked={row.visible}
                  />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Visible
                  </span>
                </label>
                <div className="flex items-end gap-2">
                  <Button type="submit" size="sm" variant="outline">
                    Save
                  </Button>
                </div>
              </form>
              <form action={deleteProjectAction} className="mt-3 flex justify-end">
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

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

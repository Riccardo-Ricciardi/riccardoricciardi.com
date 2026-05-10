import Image from "next/image";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  bulkUpdateProjectsAction,
  createProjectAction,
  deleteProjectAction,
  moveProjectAction,
  triggerSyncAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { SearchBox } from "@/components/admin/search-box";

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
  screenshot_url: string | null;
  og_image: string | null;
}

interface I18nRow {
  project_id: string;
  language_id: number;
}

interface Lang {
  id: number;
  code: string;
  name: string;
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProjectsAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { q } = await searchParams;
  const supabase = createAdminClient();

  const [{ data: rowsData }, { data: i18nData }, { data: langsData }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, repo, name, position, visible, stars, language, synced_at, screenshot_url, og_image"
        )
        .order("position", { ascending: true }),
      supabase.from("projects_i18n").select("project_id, language_id"),
      supabase
        .from("languages")
        .select("id, code, name")
        .order("id", { ascending: true }),
    ]);

  const allRows = ((rowsData ?? []) as Row[]) ?? [];
  const query = (q ?? "").toLowerCase().trim();
  const rows = query
    ? allRows.filter(
        (r) =>
          r.repo.toLowerCase().includes(query) ||
          (r.name ?? "").toLowerCase().includes(query) ||
          (r.language ?? "").toLowerCase().includes(query)
      )
    : allRows;
  const i18nRows = ((i18nData ?? []) as I18nRow[]) ?? [];
  const langs = (langsData ?? []) as Lang[];

  // Build map: project_id -> Set<language_id>
  const i18nByProject = new Map<string, Set<number>>();
  for (const row of i18nRows) {
    const set = i18nByProject.get(row.project_id) ?? new Set<number>();
    set.add(row.language_id);
    i18nByProject.set(row.project_id, set);
  }

  // Compute missing translations (across all rows, not filtered)
  const missing: { repo: string; missing: string[]; id: string }[] = [];
  for (const r of allRows) {
    const have = i18nByProject.get(r.id) ?? new Set();
    const missingLangs = langs
      .filter((l) => !have.has(l.id))
      .map((l) => l.code);
    if (missingLangs.length > 0) {
      missing.push({ id: r.id, repo: r.repo, missing: missingLangs });
    }
  }

  const lastSync = allRows.reduce<string | null>((acc, r) => {
    if (!r.synced_at) return acc;
    if (!acc) return r.synced_at;
    return r.synced_at > acc ? r.synced_at : acc;
  }, null);

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
          <p className="mt-2 text-sm text-muted-foreground">
            Edit position and visibility inline. Click row title for translations
            and screenshot.
            {query && (
              <span className="ml-1 font-mono text-xs">
                — {rows.length}/{allRows.length} matching{" "}
                <span className="text-accent-blue">&quot;{query}&quot;</span>
              </span>
            )}
          </p>
          {lastSync && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Last GitHub sync · {formatRel(lastSync)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SearchBox placeholder="Search projects…" />
          <form action={triggerSyncAction}>
            <SubmitButton
              size="sm"
              variant="outline"
              className="hover:border-accent-blue hover:text-accent-blue"
              pendingLabel="Syncing…"
            >
              Sync GitHub
            </SubmitButton>
          </form>
        </div>
      </header>

      {missing.length > 0 && (
        <div className="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
          <p className="font-medium">Missing translations</p>
          <ul className="mt-1 list-disc pl-4">
            {missing.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/projects/${m.id}`}
                  className="font-mono hover:underline"
                >
                  {m.repo}
                </Link>{" "}
                → missing description in {m.missing.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <form action={bulkUpdateProjectsAction} className="flex flex-col gap-3">
          <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-dashed border-dashed-soft text-left">
                  <Th className="w-24">Order</Th>
                  <Th className="w-16">Image</Th>
                  <Th>Repository</Th>
                  <Th>Lang · Stars</Th>
                  <Th className="w-20">Show</Th>
                  <Th className="w-32" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-dashed border-dashed-soft last:border-b-0"
                  >
                    <td className="px-3 py-2">
                      <input
                        type="hidden"
                        name={`project[${row.id}][__row]`}
                        value="1"
                      />
                      <div className="flex items-center gap-1">
                        <span className="w-5 font-mono text-xs tabular-nums text-muted-foreground">
                          {index + 1}
                        </span>
                        <button
                          type="submit"
                          formAction={moveProjectAction}
                          formNoValidate
                          disabled={index === 0}
                          name={`move:${row.id}:up`}
                          value="1"
                          aria-label="Move up"
                          className="rounded p-0.5 text-muted-foreground hover:text-accent-blue disabled:opacity-30 disabled:hover:text-muted-foreground"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="submit"
                          formAction={moveProjectAction}
                          formNoValidate
                          disabled={index === rows.length - 1}
                          name={`move:${row.id}:down`}
                          value="1"
                          aria-label="Move down"
                          className="rounded p-0.5 text-muted-foreground hover:text-accent-blue disabled:opacity-30 disabled:hover:text-muted-foreground"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/projects/${row.id}`}
                        className="block"
                        title="Manage project"
                      >
                        <span className="relative block aspect-[16/9] w-14 overflow-hidden rounded border border-dashed border-dashed-soft bg-muted/30">
                          <Image
                            src={
                              row.screenshot_url ||
                              row.og_image ||
                              `https://opengraph.githubassets.com/1/${row.repo}`
                            }
                            alt={row.repo}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/projects/${row.id}`}
                        className="block hover:text-accent-blue"
                      >
                        <p className="truncate font-mono text-sm font-medium">
                          {row.repo}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {row.name ?? "—"}
                        </p>
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">
                      {row.language ?? "—"} · ★{row.stars ?? 0}
                    </td>
                    <td className="px-3 py-2">
                      <Checkbox
                        name={`project[${row.id}][visible]`}
                        defaultChecked={row.visible ?? false}
                        aria-label="Show project on site"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/projects/${row.id}`}
                        className="mr-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-accent-blue"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteProjectAction}
                        fieldName="delete"
                        fieldValue={row.id}
                        label={`project "${row.repo}"`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SubmitButton
            className="w-full bg-accent-blue text-white"
            pendingLabel="Saving…"
          >
            Save all
          </SubmitButton>
        </form>
      )}

      <section id="add" className="scroll-mt-24">
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Add new project
        </h2>
        <form
          action={createProjectAction}
          className="grid grid-cols-2 items-end gap-2 rounded-lg border border-dashed border-dashed-soft p-3 sm:grid-cols-12"
        >
          <Field
            label="Repo (owner/name)"
            name="repo"
            required
            placeholder="Riccardo-Ricciardi/repo-name"
            className="sm:col-span-7"
          />
          <label className="flex items-center gap-2 self-end pb-2 sm:col-span-3">
            <Checkbox name="visible" defaultChecked aria-label="Show on site" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Show on site
            </span>
          </label>
          <SubmitButton
            size="sm"
            className="bg-accent-blue text-white sm:col-span-2"
            pendingLabel="Adding…"
          >
            Add
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
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
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-dashed border-dashed-soft bg-background px-2.5 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

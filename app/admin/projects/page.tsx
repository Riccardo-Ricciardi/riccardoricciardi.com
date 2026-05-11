import { Briefcase, RefreshCw } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { EmptyState } from "@/components/admin/primitives/empty-state";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { SortableProjects } from "@/components/admin/projects/sortable-projects";
import { AddProjectForm } from "@/components/admin/projects/add-project-form";
import {
  bulkUpdateProjectsAction,
  createProjectAction,
  deleteProjectAction,
  triggerSyncAction,
} from "@/app/admin/_actions/projects";
import type { Project } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function ProjectsAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("projects")
    .select(
      "id, repo, name, description, url, homepage, stars, forks, language, topics, og_image, screenshot_url, position, visible, synced_at"
    )
    .order("position", { ascending: true });

  const rows = ((data ?? []) as Project[]).map((r) => ({
    ...r,
    visible: r.visible ?? false,
    position: r.position ?? 0,
  }));

  const lastSync = rows.reduce<string | null>(
    (acc, r) =>
      r.synced_at && (!acc || r.synced_at > acc) ? r.synced_at : acc,
    null
  );

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Catalog"
        title="Projects"
        description={`Drag to reorder, toggle visibility, edit detail for translations + screenshot.${lastSync ? ` Last sync ${rel(lastSync)}.` : ""}`}
        actions={
          <form action={triggerSyncAction}>
            <SubmitButton variant="ghost" pendingLabel="Syncing…">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Sync from GitHub
            </SubmitButton>
          </form>
        }
      />

      <AddProjectForm action={createProjectAction} />

      {rows.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Add a repo above or click Sync from GitHub to import."
        />
      ) : (
        <SortableProjects
          initial={rows}
          bulkAction={bulkUpdateProjectsAction}
          deleteAction={deleteProjectAction}
        />
      )}
    </div>
  );
}

function rel(iso: string): string {
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
  return `${d}d ago`;
}

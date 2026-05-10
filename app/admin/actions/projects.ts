"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { parseMove, swapPositions } from "./_lib/move";

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const repo = String(formData.get("repo") ?? "").trim();
  const visible = formData.get("visible") === "on";

  if (!repo) redirect("/admin/projects?error=repo_required");

  const { data: maxRow } = await supabase
    .from("projects")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;
  const position = maxPos + 1;

  const { error } = await supabase.from("projects").insert({
    repo,
    position,
    visible,
  });
  if (error)
    redirect(`/admin/projects?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/projects?ok=created");
}

export async function updateProjectAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = String(formData.get("id"));
  const position = Number(formData.get("position") ?? 0);
  const visible = formData.get("visible") === "on";

  const { error } = await supabase
    .from("projects")
    .update({ position, visible })
    .eq("id", id);
  if (error)
    redirect(`/admin/projects?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/projects?ok=saved");
}

export async function upsertProjectI18nAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const project_id = String(formData.get("project_id"));
  const language_id = Number(formData.get("language_id"));
  const description = String(formData.get("description") ?? "").trim();

  if (!description) {
    await supabase
      .from("projects_i18n")
      .delete()
      .eq("project_id", project_id)
      .eq("language_id", language_id);
  } else {
    await supabase.from("projects_i18n").upsert(
      { project_id, language_id, description },
      { onConflict: "project_id,language_id" }
    );
  }

  revalidatePath("/", "layout");
  redirect(`/admin/projects/${project_id}?ok=saved`);
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("delete") ?? formData.get("id") ?? "";
  const id = String(raw);
  if (!id) redirect("/admin/projects");
  const supabase = createAdminClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/projects?ok=deleted");
}

export async function moveProjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseMove(formData);
  if (!parsed) redirect("/admin/projects");
  const id = parsed!.id;
  const direction = parsed!.direction;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("projects")
    .select("id, position")
    .order("position", { ascending: true });
  await swapPositions(
    "projects",
    (data ?? []) as Array<{ id: string; position: number | null }>,
    id,
    direction
  );
  revalidatePath("/", "layout");
  redirect("/admin/projects");
}

export async function bulkUpdateProjectsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = { position?: number; visible?: boolean };
  const updates = new Map<string, Update>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^project\[([^\]]+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = m[1];
    const field = m[2];
    const u = updates.get(id) ?? {};
    if (field === "position") u.position = Number(value) || 0;
    else if (field === "visible") u.visible = value === "on" || value === "true";
    updates.set(id, u);
  }

  const rowIds = new Set<string>();
  for (const k of formData.keys()) {
    const m = k.match(/^project\[([^\]]+)\]\[__row\]$/);
    if (m) rowIds.add(m[1]);
  }

  for (const id of rowIds) {
    const u = updates.get(id) ?? {};
    if (!("visible" in u)) u.visible = false;
    if (Object.keys(u).length === 0) continue;
    await supabase.from("projects").update(u).eq("id", id);
  }

  revalidatePath("/", "layout");
  redirect("/admin/projects?ok=saved");
}

export async function triggerSyncAction() {
  await requireAdmin();
  const cronSecret = process.env.CRON_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!cronSecret || !siteUrl) return;

  await fetch(`${siteUrl}/api/cron/sync-github`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  }).catch(() => {});

  revalidatePath("/", "layout");
  redirect("/admin/projects");
}

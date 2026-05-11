"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import {
  uploadImage,
  deleteImage,
  pathFromPublicUrl,
} from "@/utils/storage/upload";
import { asBool, asInt, asStr, bounce } from "./_shared";

const PATH = "/admin/projects";

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const repo = asStr(formData.get("repo"));
  const visible = asBool(formData.get("visible"));
  if (!repo) bounce(PATH, undefined, "repo_required");

  const { data: maxRow } = await supabase
    .from("projects")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;

  const { error } = await supabase
    .from("projects")
    .insert({ repo, visible, position: maxPos + 1 });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("delete") ?? formData.get("id") ?? "");
  if (!id) bounce(PATH);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("projects")
    .select("screenshot_url")
    .eq("id", id)
    .maybeSingle();
  const row = data as { screenshot_url: string | null } | null;

  await supabase.from("projects").delete().eq("id", id);

  if (row?.screenshot_url) {
    const p = pathFromPublicUrl(row.screenshot_url);
    if (p) await deleteImage(p);
  }

  bounce(PATH, "deleted");
}

export async function bulkUpdateProjectsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = { visible?: boolean };
  const updates = new Map<string, Update>();
  const rowIds = new Set<string>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^project\[([^\]]+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = m[1];
    const field = m[2];
    if (field === "__row") {
      rowIds.add(id);
      continue;
    }
    const u = updates.get(id) ?? {};
    if (field === "visible") u.visible = value === "on" || value === "true";
    updates.set(id, u);
  }

  for (const id of rowIds) {
    const u = updates.get(id) ?? {};
    if (!("visible" in u)) u.visible = false;
    await supabase.from("projects").update(u).eq("id", id);
  }

  const order = String(formData.get("order") ?? "");
  if (order) {
    const ids = order.split(",").map((s) => s.trim()).filter(Boolean);
    await Promise.all(
      ids.map((id, index) =>
        supabase.from("projects").update({ position: index }).eq("id", id)
      )
    );
  }

  bounce(PATH, "saved");
}

export async function uploadProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file") as File | null;
  if (!id || !file || file.size === 0) bounce(PATH, undefined, "no_file");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("projects")
    .select("repo, screenshot_url")
    .eq("id", id)
    .maybeSingle();
  const project = data as
    | { repo: string; screenshot_url: string | null }
    | null;
  const safeRepo = project?.repo.replace("/", "-") ?? id;

  try {
    const { url } = await uploadImage(file as File, {
      folder: `projects/${id}`,
      basename: safeRepo,
    });
    await supabase
      .from("projects")
      .update({ screenshot_url: url })
      .eq("id", id);
    if (project?.screenshot_url) {
      const oldPath = pathFromPublicUrl(project.screenshot_url);
      if (oldPath) await deleteImage(oldPath);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upload_failed";
    bounce(`${PATH}/${id}`, undefined, encodeURIComponent(msg));
  }

  bounce(`${PATH}/${id}`, "uploaded");
}

export async function clearProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) bounce(PATH);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("projects")
    .select("screenshot_url")
    .eq("id", id)
    .maybeSingle();
  const row = data as { screenshot_url: string | null } | null;

  await supabase
    .from("projects")
    .update({ screenshot_url: null })
    .eq("id", id);

  if (row?.screenshot_url) {
    const p = pathFromPublicUrl(row.screenshot_url);
    if (p) await deleteImage(p);
  }

  bounce(`${PATH}/${id}`, "cleared");
}

export async function upsertProjectI18nAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const project_id = String(formData.get("project_id") ?? "");
  const language_id = asInt(formData.get("language_id"));
  const description = asStr(formData.get("description"));
  if (!project_id || !language_id) bounce(PATH);

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

  bounce(`${PATH}/${project_id}`, "saved");
}

export async function triggerSyncAction() {
  await requireAdmin();
  const cronSecret = process.env.CRON_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!cronSecret || !siteUrl) bounce(PATH);

  await fetch(`${siteUrl}/api/cron/sync-github`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  }).catch(() => {});

  bounce(PATH, "saved");
}

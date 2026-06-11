"use server";

import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import {
  uploadImage,
  deleteImage,
  pathFromPublicUrl,
} from "@/utils/storage/upload";
import { getCronSecretOptional, getSiteUrlOptional } from "@/utils/env";
import { asBool, asInt, asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/projects";

const kindSchema = z.enum(["repo", "case_study"]);
const statusSchema = z.enum(["live", "shipped", "archived"]);
const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case");

type ProjectKind = z.infer<typeof kindSchema>;

function parseSlug(
  raw: string,
  kind: ProjectKind,
  errPath: string
): string | null {
  if (kind === "case_study") {
    const parsed = slugSchema.safeParse(raw);
    if (!parsed.success) bounce(errPath, undefined, "slug_required");
    return parsed.data;
  }
  if (!raw) return null;
  const parsed = slugSchema.safeParse(raw);
  if (!parsed.success) bounce(errPath, undefined, "invalid_slug");
  return parsed.data;
}

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const kindParsed = kindSchema.safeParse(asStr(formData.get("kind")) || "repo");
  if (!kindParsed.success) bounce(PATH, undefined, "invalid_kind");
  const kind = kindParsed.data;

  const repo = asNullableStr(formData.get("repo"));
  const visible = asBool(formData.get("visible"));
  if (kind === "repo" && !repo) bounce(PATH, undefined, "repo_required");

  const slug = parseSlug(asStr(formData.get("slug")).toLowerCase(), kind, PATH);

  const { data: maxRow } = await supabase
    .from("projects")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;

  const { error } = await supabase
    .from("projects")
    .insert({ repo, kind, slug, visible, position: maxPos + 1 });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function updateProjectDetailsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = String(formData.get("id") ?? "");
  if (!id) bounce(PATH);
  const detailPath = `${PATH}/${id}`;

  const kindParsed = kindSchema.safeParse(asStr(formData.get("kind")));
  if (!kindParsed.success) bounce(detailPath, undefined, "invalid_kind");
  const kind = kindParsed.data;

  const statusRaw = asStr(formData.get("status"));
  let status: string | null = null;
  if (statusRaw && statusRaw !== "none") {
    const statusParsed = statusSchema.safeParse(statusRaw);
    if (!statusParsed.success) bounce(detailPath, undefined, "invalid_status");
    status = statusParsed.data;
  }

  const repo = asNullableStr(formData.get("repo"));
  if (kind === "repo" && !repo) bounce(detailPath, undefined, "repo_required");

  const slug = parseSlug(
    asStr(formData.get("slug")).toLowerCase(),
    kind,
    detailPath
  );

  const surface = asNullableStr(formData.get("surface"));
  const telemetry = asNullableStr(formData.get("telemetry"));
  const featured = asBool(formData.get("featured"));

  const { error } = await supabase
    .from("projects")
    .update({ kind, status, repo, slug, surface, telemetry, featured })
    .eq("id", id);
  if (error) bounce(detailPath, undefined, encodeURIComponent(error.message));

  bounce(detailPath, "saved");
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

  await Promise.all(
    Array.from(rowIds).map((id) => {
      const u = updates.get(id) ?? {};
      if (!("visible" in u)) u.visible = false;
      return supabase.from("projects").update(u).eq("id", id);
    }),
  );

  const order = String(formData.get("order") ?? "");
  if (order) {
    const ids = order.split(",").flatMap((s) => {
      const t = s.trim();
      return t ? [t] : [];
    });
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
    | { repo: string | null; screenshot_url: string | null }
    | null;
  const safeRepo = project?.repo?.replace("/", "-") ?? id;

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
  const one_liner = asStr(formData.get("one_liner"));
  const problem = asStr(formData.get("problem"));
  const solution = asStr(formData.get("solution"));
  const outcome = asStr(formData.get("outcome"));
  const metricsRaw = asStr(formData.get("metrics"));
  if (!project_id || !language_id) bounce(PATH);

  const metrics = metricsRaw.split(/\r?\n/).flatMap((s) => {
    const t = s.trim();
    return t ? [t] : [];
  });

  const hasAnyValue =
    Boolean(description) ||
    Boolean(one_liner) ||
    Boolean(problem) ||
    Boolean(solution) ||
    Boolean(outcome) ||
    metrics.length > 0;

  if (!hasAnyValue) {
    await supabase
      .from("projects_i18n")
      .delete()
      .eq("project_id", project_id)
      .eq("language_id", language_id);
  } else {
    await supabase.from("projects_i18n").upsert(
      {
        project_id,
        language_id,
        description: description || null,
        one_liner: one_liner || null,
        problem: problem || null,
        solution: solution || null,
        outcome: outcome || null,
        metrics,
      },
      { onConflict: "project_id,language_id" }
    );
  }

  bounce(`${PATH}/${project_id}`, "saved");
}

export async function updateProjectNarrativeAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = String(formData.get("id") ?? "");
  if (!id) bounce(PATH);

  const problem = asStr(formData.get("problem"));
  const solution = asStr(formData.get("solution"));
  const outcome = asStr(formData.get("outcome"));

  await supabase
    .from("projects")
    .update({
      problem: problem || null,
      solution: solution || null,
      outcome: outcome || null,
    })
    .eq("id", id);

  bounce(`${PATH}/${id}`, "saved");
}

export async function triggerSyncAction(): Promise<never> {
  await requireAdmin();
  const cronSecret = getCronSecretOptional();
  const siteUrl = getSiteUrlOptional();
  if (!cronSecret || !siteUrl) bounce(PATH);

  await fetch(`${siteUrl}/api/cron/sync-github`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  }).catch(() => {});

  bounce(PATH, "saved");
}

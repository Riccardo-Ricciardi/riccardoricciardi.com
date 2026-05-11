"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asBool, asInt, asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/work";

export async function createWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const company = asStr(formData.get("company"));
  const role = asStr(formData.get("role"));
  const started_at = asStr(formData.get("started_at"));

  if (!company || !role || !started_at) {
    bounce(PATH, undefined, "fields_required");
  }

  const { error } = await supabase.from("work_experience").insert({
    company,
    role,
    started_at,
    is_current: false,
    position: 0,
  });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function deleteWorkAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("delete") ?? formData.get("id"));
  if (!id) bounce(PATH);
  const supabase = createAdminClient();
  await supabase.from("work_experience").delete().eq("id", id);
  bounce(PATH, "deleted");
}

export async function bulkUpdateWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = {
    company?: string;
    role?: string;
    url?: string | null;
    location?: string | null;
    started_at?: string;
    ended_at?: string | null;
    is_current?: boolean;
  };
  const updates = new Map<number, Update>();
  const rowIds = new Set<number>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^work\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = Number(m[1]);
    const field = m[2];
    if (field === "__row") {
      rowIds.add(id);
      continue;
    }
    const u = updates.get(id) ?? {};
    if (field === "company") u.company = value.trim();
    else if (field === "role") u.role = value.trim();
    else if (field === "url") u.url = value.trim() || null;
    else if (field === "location") u.location = value.trim() || null;
    else if (field === "started_at") u.started_at = value.trim();
    else if (field === "ended_at") u.ended_at = value.trim() || null;
    else if (field === "is_current")
      u.is_current = value === "on" || value === "true";
    updates.set(id, u);
  }

  const now = new Date().toISOString();
  for (const id of rowIds) {
    const u = updates.get(id) ?? {};
    if (!("is_current" in u)) u.is_current = false;
    if (u.is_current) u.ended_at = null;
    if (Object.keys(u).length === 0) continue;
    await supabase
      .from("work_experience")
      .update({ ...u, updated_at: now })
      .eq("id", id);
  }

  bounce(PATH, "saved");
}

export async function upsertWorkI18nAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const experience_id = asInt(formData.get("experience_id"));
  const language_id = asInt(formData.get("language_id"));
  const summary = asNullableStr(formData.get("summary"));
  const bulletsRaw = asStr(formData.get("bullets"));

  if (!experience_id || !language_id) bounce(PATH);

  const bullets = bulletsRaw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!summary && bullets.length === 0) {
    await supabase
      .from("work_experience_i18n")
      .delete()
      .eq("experience_id", experience_id)
      .eq("language_id", language_id);
  } else {
    await supabase.from("work_experience_i18n").upsert(
      { experience_id, language_id, summary, bullets },
      { onConflict: "experience_id,language_id" }
    );
  }

  bounce(PATH, "saved");
}

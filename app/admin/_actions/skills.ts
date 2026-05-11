"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import {
  uploadImage,
  deleteImage,
  pathFromPublicUrl,
} from "@/utils/storage/upload";
import { asBool, asInt, asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/skills";

export async function createSkillAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const name = asStr(formData.get("name"));
  const percentage = Math.max(0, Math.min(100, asInt(formData.get("percentage"))));
  const dark = asBool(formData.get("dark"));
  const category = asNullableStr(formData.get("category"));

  if (!name) bounce(PATH, undefined, "name_required");

  const { data: maxRow } = await supabase
    .from("skills")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;

  const { error } = await supabase.from("skills").insert({
    name,
    position: maxPos + 1,
    percentage,
    dark,
    category,
  });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function deleteSkillAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("delete") ?? formData.get("id"));
  if (!id) bounce(PATH);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("skills")
    .select("icon_url, icon_dark_url")
    .eq("id", id)
    .maybeSingle();
  const row = data as { icon_url: string | null; icon_dark_url: string | null } | null;

  await supabase.from("skills").delete().eq("id", id);

  for (const url of [row?.icon_url, row?.icon_dark_url]) {
    if (!url) continue;
    const p = pathFromPublicUrl(url);
    if (p) await deleteImage(p);
  }

  bounce(PATH, "deleted");
}

export async function reorderSkillsAction(formData: FormData) {
  await requireAdmin();
  const order = String(formData.get("order") ?? "");
  if (!order) bounce(PATH);

  const ids = order
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (ids.length === 0) bounce(PATH);

  const supabase = createAdminClient();
  await Promise.all(
    ids.map((id, index) =>
      supabase.from("skills").update({ position: index }).eq("id", id)
    )
  );

  bounce(PATH, "saved");
}

export async function bulkUpdateSkillsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = {
    name?: string;
    percentage?: number;
    category?: string | null;
    dark?: boolean;
  };
  const updates = new Map<number, Update>();
  const rowIds = new Set<number>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^skill\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = Number(m[1]);
    const field = m[2];
    if (field === "__row") {
      rowIds.add(id);
      continue;
    }
    const u = updates.get(id) ?? {};
    if (field === "name") u.name = value.trim();
    else if (field === "percentage")
      u.percentage = Math.max(0, Math.min(100, Number(value) || 0));
    else if (field === "category") u.category = value.trim() || null;
    else if (field === "dark") u.dark = value === "on" || value === "true";
    updates.set(id, u);
  }

  for (const id of rowIds) {
    const u = updates.get(id) ?? {};
    if (!("dark" in u)) u.dark = false;
    if (Object.keys(u).length === 0) continue;
    await supabase.from("skills").update(u).eq("id", id);
  }

  const order = String(formData.get("order") ?? "");
  if (order) {
    const ids = order
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    await Promise.all(
      ids.map((id, index) =>
        supabase.from("skills").update({ position: index }).eq("id", id)
      )
    );
  }

  bounce(PATH, "saved");
}

export async function uploadSkillIconAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("id"));
  const variant = String(formData.get("variant") ?? "light");
  const file = formData.get("file") as File | null;

  if (!id || !file || file.size === 0) bounce(PATH, undefined, "no_file");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("skills")
    .select("name, icon_url, icon_dark_url")
    .eq("id", id)
    .maybeSingle();
  const skill = data as
    | { name: string; icon_url: string | null; icon_dark_url: string | null }
    | null;

  try {
    const { url } = await uploadImage(file as File, {
      folder: `skills/${id}`,
      basename: `${skill?.name ?? "skill"}-${variant}`,
    });
    const column = variant === "dark" ? "icon_dark_url" : "icon_url";
    const previousUrl =
      variant === "dark" ? skill?.icon_dark_url : skill?.icon_url;
    const update: Record<string, string | boolean> = { [column]: url };
    if (variant === "dark") update.dark = true;

    await supabase.from("skills").update(update).eq("id", id);
    if (previousUrl) {
      const oldPath = pathFromPublicUrl(previousUrl);
      if (oldPath) await deleteImage(oldPath);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upload_failed";
    bounce(PATH, undefined, encodeURIComponent(msg));
  }

  bounce(PATH, "uploaded");
}

export async function clearSkillIconAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("id"));
  const variant = String(formData.get("variant") ?? "light");
  if (!id) bounce(PATH);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("skills")
    .select("icon_url, icon_dark_url")
    .eq("id", id)
    .maybeSingle();
  const row = data as { icon_url: string | null; icon_dark_url: string | null } | null;
  const column = variant === "dark" ? "icon_dark_url" : "icon_url";
  const url = variant === "dark" ? row?.icon_dark_url : row?.icon_url;

  const update: Record<string, string | boolean | null> = { [column]: null };
  if (variant === "dark") update.dark = false;
  await supabase.from("skills").update(update).eq("id", id);

  if (url) {
    const oldPath = pathFromPublicUrl(url);
    if (oldPath) await deleteImage(oldPath);
  }

  bounce(PATH, "cleared");
}

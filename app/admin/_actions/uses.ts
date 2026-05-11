"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asBool, asInt, asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/uses";

export async function createUsesItemAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const category = asStr(formData.get("category"));
  const name = asStr(formData.get("name"));
  const url = asNullableStr(formData.get("url"));

  if (!category || !name) bounce(PATH, undefined, "fields_required");

  const { data: maxRow } = await supabase
    .from("uses_items")
    .select("position")
    .eq("category", category)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;

  const { error } = await supabase.from("uses_items").insert({
    category,
    name,
    url,
    visible: true,
    position: maxPos + 1,
  });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function deleteUsesItemAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("delete") ?? formData.get("id"));
  if (!id) bounce(PATH);
  const supabase = createAdminClient();
  await supabase.from("uses_items").delete().eq("id", id);
  bounce(PATH, "deleted");
}

export async function bulkUpdateUsesAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = {
    category?: string;
    name?: string;
    url?: string | null;
    icon_url?: string | null;
    position?: number;
    visible?: boolean;
  };
  const updates = new Map<number, Update>();
  const rowIds = new Set<number>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^uses\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = Number(m[1]);
    const field = m[2];
    if (field === "__row") {
      rowIds.add(id);
      continue;
    }
    const u = updates.get(id) ?? {};
    if (field === "category") u.category = value.trim();
    else if (field === "name") u.name = value.trim();
    else if (field === "url") u.url = value.trim() || null;
    else if (field === "icon_url") u.icon_url = value.trim() || null;
    else if (field === "position") u.position = Number(value) || 0;
    else if (field === "visible")
      u.visible = value === "on" || value === "true";
    updates.set(id, u);
  }

  const now = new Date().toISOString();
  for (const id of rowIds) {
    const u = updates.get(id) ?? {};
    if (!("visible" in u)) u.visible = false;
    if (Object.keys(u).length === 0) continue;
    await supabase
      .from("uses_items")
      .update({ ...u, updated_at: now })
      .eq("id", id);
  }

  bounce(PATH, "saved");
}

export async function upsertUsesI18nAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const item_id = asInt(formData.get("item_id"));
  const language_id = asInt(formData.get("language_id"));
  const description = asNullableStr(formData.get("description"));

  if (!item_id || !language_id) bounce(PATH);

  if (!description) {
    await supabase
      .from("uses_items_i18n")
      .delete()
      .eq("item_id", item_id)
      .eq("language_id", language_id);
  } else {
    await supabase.from("uses_items_i18n").upsert(
      { item_id, language_id, description },
      { onConflict: "item_id,language_id" }
    );
  }

  bounce(PATH, "saved");
}

"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asBool, asInt, asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/contact";

export async function createSocialLinkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const kind = asStr(formData.get("kind")) || "custom";
  const label = asNullableStr(formData.get("label"));
  const url = asStr(formData.get("url"));
  if (!url) bounce(PATH, undefined, "url_required");

  const { data: maxRow } = await supabase
    .from("social_links")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;

  const { error } = await supabase.from("social_links").insert({
    kind,
    label,
    url,
    visible: true,
    position: maxPos + 1,
  });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function deleteSocialLinkAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("delete") ?? formData.get("id"));
  if (!id) bounce(PATH);
  const supabase = createAdminClient();
  await supabase.from("social_links").delete().eq("id", id);
  bounce(PATH, "deleted");
}

export async function bulkUpdateSocialAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = {
    kind?: string;
    label?: string | null;
    url?: string;
    visible?: boolean;
  };
  const updates = new Map<number, Update>();
  const rowIds = new Set<number>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^social\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = Number(m[1]);
    const field = m[2];
    if (field === "__row") {
      rowIds.add(id);
      continue;
    }
    const u = updates.get(id) ?? {};
    if (field === "kind") u.kind = value.trim();
    else if (field === "label") u.label = value.trim() || null;
    else if (field === "url") u.url = value.trim();
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
      .from("social_links")
      .update({ ...u, updated_at: now })
      .eq("id", id);
  }

  const order = String(formData.get("order") ?? "");
  if (order) {
    const ids = order
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    await Promise.all(
      ids.map((id, index) =>
        supabase.from("social_links").update({ position: index }).eq("id", id)
      )
    );
  }

  bounce(PATH, "saved");
}

"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asInt, asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/about";

export async function createAboutSectionAction(formData: FormData) {
  await requireAdmin();
  const language_id = asInt(formData.get("language_id"));
  if (!language_id) bounce(PATH, undefined, "language_required");

  const supabase = createAdminClient();
  const { data: maxRow } = await supabase
    .from("about_sections")
    .select("position")
    .eq("language_id", language_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;

  const { error } = await supabase.from("about_sections").insert({
    language_id,
    heading: null,
    body: "",
    position: maxPos + 1,
  });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function deleteAboutSectionAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("delete") ?? formData.get("id"));
  if (!id) bounce(PATH);

  const supabase = createAdminClient();
  await supabase.from("about_sections").delete().eq("id", id);
  bounce(PATH, "deleted");
}

export async function bulkUpdateAboutAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = { heading?: string | null; body?: string };
  const updates = new Map<number, Update>();
  const rowIds = new Set<number>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^about\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = Number(m[1]);
    const field = m[2];
    if (field === "__row") {
      rowIds.add(id);
      continue;
    }
    const u = updates.get(id) ?? {};
    if (field === "heading") u.heading = value.trim() || null;
    else if (field === "body") u.body = value;
    updates.set(id, u);
  }

  const now = new Date().toISOString();
  for (const id of rowIds) {
    const u = updates.get(id);
    if (!u) continue;
    await supabase
      .from("about_sections")
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
        supabase.from("about_sections").update({ position: index }).eq("id", id)
      )
    );
  }

  bounce(PATH, "saved");
}

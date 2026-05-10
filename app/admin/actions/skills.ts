"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { parseMove, swapPositions } from "./_lib/move";

export async function createSkillAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  const percentage = Number(formData.get("percentage") ?? 0);
  const dark = formData.get("dark") === "on";
  const category = String(formData.get("category") ?? "").trim() || null;

  if (!name) redirect("/admin/skills?error=name_required");

  const { data: maxRow } = await supabase
    .from("skills")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;
  const position = maxPos + 1;

  const { error } = await supabase.from("skills").insert({
    name,
    position,
    percentage,
    dark,
    category,
  });
  if (error) redirect(`/admin/skills?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/skills?ok=created");
}

export async function updateSkillAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const position = Number(formData.get("position") ?? 0);
  const percentage = Number(formData.get("percentage") ?? 0);
  const dark = formData.get("dark") === "on";
  const category = String(formData.get("category") ?? "").trim() || null;

  const { error } = await supabase
    .from("skills")
    .update({ name, position, percentage, dark, category })
    .eq("id", id);
  if (error) redirect(`/admin/skills?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/skills?ok=saved");
}

export async function deleteSkillAction(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("delete") ?? formData.get("id") ?? "";
  const id = Number(raw);
  if (!id) redirect("/admin/skills");
  const supabase = createAdminClient();
  await supabase.from("skills").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/skills?ok=deleted");
}

export async function moveSkillAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseMove(formData);
  if (!parsed) redirect("/admin/skills");
  const id = Number(parsed!.id);
  const direction = parsed!.direction;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("skills")
    .select("id, position")
    .order("position", { ascending: true });
  await swapPositions(
    "skills",
    (data ?? []) as Array<{ id: number; position: number | null }>,
    id,
    direction
  );
  revalidatePath("/", "layout");
  redirect("/admin/skills");
}

export async function bulkUpdateSkillsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = {
    name?: string;
    position?: number;
    percentage?: number;
    category?: string | null;
    dark?: boolean;
  };
  const updates = new Map<number, Update>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^skill\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = Number(m[1]);
    const field = m[2];
    const u = updates.get(id) ?? {};
    if (field === "name") u.name = value.trim();
    else if (field === "position") u.position = Number(value) || 0;
    else if (field === "percentage") u.percentage = Number(value) || 0;
    else if (field === "category") u.category = value.trim() || null;
    else if (field === "dark") u.dark = value === "on" || value === "true";
    updates.set(id, u);
  }

  const rowIds = new Set<number>();
  for (const k of formData.keys()) {
    const m = k.match(/^skill\[(\d+)\]\[__row\]$/);
    if (m) rowIds.add(Number(m[1]));
  }

  for (const id of rowIds) {
    const u = updates.get(id) ?? {};
    if (!("dark" in u)) u.dark = false;
    if (Object.keys(u).length === 0) continue;
    await supabase.from("skills").update(u).eq("id", id);
  }

  revalidatePath("/", "layout");
  redirect("/admin/skills?ok=saved");
}

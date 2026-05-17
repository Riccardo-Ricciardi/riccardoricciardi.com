"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asInt, asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/skills";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createSkillCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const rawSlug = asNullableStr(formData.get("slug"));
  const labelIt = asStr(formData.get("label_it"));
  const labelEn = asStr(formData.get("label_en"));
  const icon = asNullableStr(formData.get("icon"));

  if (!labelIt || !labelEn) bounce(PATH, undefined, "label_required");

  const slug = slugify(rawSlug ?? labelEn);
  if (!slug) bounce(PATH, undefined, "slug_required");

  const { data: maxRow } = await supabase
    .from("skill_categories")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;

  const { error } = await supabase.from("skill_categories").insert({
    slug,
    label_it: labelIt,
    label_en: labelEn,
    icon,
    position: maxPos + 1,
  });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "category_created");
}

export async function deleteSkillCategoryAction(formData: FormData) {
  await requireAdmin();
  const slug = asStr(formData.get("delete") ?? formData.get("slug"));
  if (!slug) bounce(PATH);

  const supabase = createAdminClient();
  await supabase.from("skills").update({ category: null }).eq("category", slug);
  await supabase.from("skill_categories").delete().eq("slug", slug);

  bounce(PATH, "category_deleted");
}

export async function bulkUpdateSkillCategoriesAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = {
    label_it?: string;
    label_en?: string;
    icon?: string | null;
  };
  const updates = new Map<string, Update>();
  const rowSlugs = new Set<string>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^cat\[([^\]]+)\]\[(\w+)\]$/);
    if (!m) continue;
    const slug = m[1];
    const field = m[2];
    if (field === "__row") {
      rowSlugs.add(slug);
      continue;
    }
    const u = updates.get(slug) ?? {};
    if (field === "label_it") u.label_it = value.trim();
    else if (field === "label_en") u.label_en = value.trim();
    else if (field === "icon") u.icon = value.trim() || null;
    updates.set(slug, u);
  }

  for (const slug of rowSlugs) {
    const u = updates.get(slug);
    if (!u || Object.keys(u).length === 0) continue;
    await supabase.from("skill_categories").update(u).eq("slug", slug);
  }

  const order = String(formData.get("category_order") ?? "");
  if (order) {
    const slugs = order.split(",").map((s) => s.trim()).filter(Boolean);
    await Promise.all(
      slugs.map((slug, index) =>
        supabase.from("skill_categories").update({ position: index }).eq("slug", slug)
      )
    );
  }

  bounce(PATH, "saved");
}

export async function moveSkillCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("id"));
  const target = asNullableStr(formData.get("category"));
  if (!id) bounce(PATH);

  const supabase = createAdminClient();
  await supabase.from("skills").update({ category: target }).eq("id", id);
  bounce(PATH, "moved");
}

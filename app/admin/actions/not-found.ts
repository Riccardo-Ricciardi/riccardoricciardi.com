"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";

export async function updateNotFoundAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();
  const language_id = Number(formData.get("language_id"));
  const value = String(formData.get("value") ?? "").trim();

  if (!slug || !language_id) {
    redirect("/admin/not-found?error=fields_required");
  }

  const { data: existing } = await supabase
    .from("not_found")
    .select("id")
    .eq("slug", slug)
    .eq("language_id", language_id)
    .maybeSingle();

  const existingRow = existing as { id: number } | null;

  if (!value) {
    if (existingRow) {
      await supabase.from("not_found").delete().eq("id", existingRow.id);
    }
  } else if (existingRow) {
    await supabase
      .from("not_found")
      .update({ value })
      .eq("id", existingRow.id);
  } else {
    const { data: maxRow } = await supabase
      .from("not_found")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const maxPos =
      (maxRow as { position: number | null } | null)?.position ?? -1;
    await supabase
      .from("not_found")
      .insert({ slug, value, language_id, position: maxPos + 1 });
  }

  revalidatePath("/", "layout");
  redirect("/admin/not-found?ok=saved");
}

export async function createNotFoundSlugAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/not-found?error=slug_required");

  const { data: maxRow } = await supabase
    .from("not_found")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos =
    (maxRow as { position: number | null } | null)?.position ?? -1;
  const position = maxPos + 1;

  const { data: langs } = await supabase.from("languages").select("id");
  const rows = ((langs ?? []) as Array<{ id: number }>).map((l) => ({
    slug,
    language_id: l.id,
    value: "",
    position,
  }));
  if (rows.length > 0) {
    await supabase.from("not_found").insert(rows);
  }

  revalidatePath("/", "layout");
  redirect("/admin/not-found?ok=created");
}

export async function deleteNotFoundSlugAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? formData.get("delete") ?? "");
  if (!slug) redirect("/admin/not-found");
  const supabase = createAdminClient();
  await supabase.from("not_found").delete().eq("slug", slug);
  revalidatePath("/", "layout");
  redirect("/admin/not-found?ok=deleted");
}

export async function bulkUpdateAllNotFoundAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = { slug: string; language_id: number; value: string };
  const updates: Update[] = [];

  for (const [key, raw] of formData.entries()) {
    const m = key.match(/^notfound\[(.+?)\]\[value_(\d+)\]$/);
    if (!m) continue;
    updates.push({
      slug: m[1],
      language_id: Number(m[2]),
      value: String(typeof raw === "string" ? raw : "").trim(),
    });
  }

  // Fetch all existing rows once
  const slugs = Array.from(new Set(updates.map((u) => u.slug)));
  const { data: existing } = await supabase
    .from("not_found")
    .select("id, slug, language_id, position")
    .in("slug", slugs);

  const existingMap = new Map<string, { id: number; position: number | null }>();
  for (const r of (existing ?? []) as Array<{
    id: number;
    slug: string;
    language_id: number;
    position: number | null;
  }>) {
    existingMap.set(`${r.slug}::${r.language_id}`, {
      id: r.id,
      position: r.position,
    });
  }

  const { data: maxRow } = await supabase
    .from("not_found")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextPos =
    ((maxRow as { position: number | null } | null)?.position ?? -1) + 1;

  for (const u of updates) {
    const key = `${u.slug}::${u.language_id}`;
    const existingRow = existingMap.get(key);

    if (!u.value) {
      if (existingRow) {
        await supabase.from("not_found").delete().eq("id", existingRow.id);
      }
    } else if (existingRow) {
      await supabase
        .from("not_found")
        .update({ value: u.value })
        .eq("id", existingRow.id);
    } else {
      await supabase.from("not_found").insert({
        slug: u.slug,
        value: u.value,
        language_id: u.language_id,
        position: nextPos++,
      });
    }
  }

  revalidatePath("/", "layout");
  redirect("/admin/not-found?ok=saved");
}

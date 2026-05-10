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

export async function bulkUpdateNotFoundSlugAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/not-found?error=slug_required");

  const updates: Array<{ language_id: number; value: string }> = [];
  for (const [key, raw] of formData.entries()) {
    const m = key.match(/^value_(\d+)$/);
    if (!m) continue;
    updates.push({
      language_id: Number(m[1]),
      value: String(typeof raw === "string" ? raw : "").trim(),
    });
  }

  for (const u of updates) {
    const { data: existing } = await supabase
      .from("not_found")
      .select("id, position")
      .eq("slug", slug)
      .eq("language_id", u.language_id)
      .maybeSingle();

    const existingRow = existing as { id: number; position: number | null } | null;

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
      const { data: maxRow } = await supabase
        .from("not_found")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      const maxPos =
        (maxRow as { position: number | null } | null)?.position ?? -1;
      await supabase.from("not_found").insert({
        slug,
        value: u.value,
        language_id: u.language_id,
        position: maxPos + 1,
      });
    }
  }

  revalidatePath("/", "layout");
  redirect("/admin/not-found?ok=saved");
}

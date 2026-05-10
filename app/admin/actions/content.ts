"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";

export async function updateContentAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();
  const language_id = Number(formData.get("language_id"));
  const value = String(formData.get("value") ?? "").trim();

  if (!slug || !language_id) {
    redirect("/admin/content?error=fields_required");
  }

  if (!value) {
    await supabase
      .from("content_blocks")
      .delete()
      .eq("slug", slug)
      .eq("language_id", language_id);
  } else {
    await supabase.from("content_blocks").upsert(
      { slug, language_id, value, updated_at: new Date().toISOString() },
      { onConflict: "slug,language_id" }
    );
  }

  revalidatePath("/", "layout");
  redirect("/admin/content?ok=saved");
}

export async function createContentSlugAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/content?error=slug_required");

  const { data: langs } = await supabase.from("languages").select("id");
  const rows = ((langs ?? []) as Array<{ id: number }>).map((l) => ({
    slug,
    language_id: l.id,
    value: "",
  }));
  if (rows.length > 0) {
    await supabase.from("content_blocks").upsert(rows, {
      onConflict: "slug,language_id",
      ignoreDuplicates: true,
    });
  }

  revalidatePath("/", "layout");
  redirect("/admin/content?ok=created");
}

export async function deleteContentSlugAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? formData.get("delete") ?? "");
  if (!slug) redirect("/admin/content");
  const supabase = createAdminClient();
  await supabase.from("content_blocks").delete().eq("slug", slug);
  revalidatePath("/", "layout");
  redirect("/admin/content?ok=deleted");
}

export async function bulkUpdateContentSlugAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/content?error=slug_required");

  const updates: Array<{ language_id: number; value: string }> = [];
  for (const [key, raw] of formData.entries()) {
    const m = key.match(/^value_(\d+)$/);
    if (!m) continue;
    updates.push({
      language_id: Number(m[1]),
      value: String(typeof raw === "string" ? raw : "").trim(),
    });
  }

  const now = new Date().toISOString();
  for (const u of updates) {
    if (!u.value) {
      await supabase
        .from("content_blocks")
        .delete()
        .eq("slug", slug)
        .eq("language_id", u.language_id);
    } else {
      await supabase.from("content_blocks").upsert(
        { slug, language_id: u.language_id, value: u.value, updated_at: now },
        { onConflict: "slug,language_id" }
      );
    }
  }

  revalidatePath("/", "layout");
  redirect("/admin/content?ok=saved");
}

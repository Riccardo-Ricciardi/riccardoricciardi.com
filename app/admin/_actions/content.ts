"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asStr, bounce } from "./_shared";

const PATH = "/admin/content";

export async function createContentSlugAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const slug = asStr(formData.get("slug"));
  if (!slug) bounce(PATH, undefined, "slug_required");

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

  bounce(PATH, "created");
}

export async function deleteContentSlugAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("delete") ?? formData.get("slug") ?? "");
  if (!slug) bounce(PATH);
  const supabase = createAdminClient();
  await supabase.from("content_blocks").delete().eq("slug", slug);
  bounce(PATH, "deleted");
}

export async function bulkUpdateContentAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = { slug: string; language_id: number; value: string };
  const updates: Update[] = [];

  for (const [key, raw] of formData.entries()) {
    const m = key.match(/^content\[(.+?)\]\[lang_(\d+)\]$/);
    if (!m) continue;
    updates.push({
      slug: m[1],
      language_id: Number(m[2]),
      value: String(typeof raw === "string" ? raw : "").trim(),
    });
  }

  const now = new Date().toISOString();
  const upserts: Array<{
    slug: string;
    language_id: number;
    value: string;
    updated_at: string;
  }> = [];
  const deletes: Array<{ slug: string; language_id: number }> = [];

  for (const u of updates) {
    if (!u.value) deletes.push({ slug: u.slug, language_id: u.language_id });
    else
      upserts.push({
        slug: u.slug,
        language_id: u.language_id,
        value: u.value,
        updated_at: now,
      });
  }

  if (upserts.length > 0) {
    await supabase
      .from("content_blocks")
      .upsert(upserts, { onConflict: "slug,language_id" });
  }
  for (const d of deletes) {
    await supabase
      .from("content_blocks")
      .delete()
      .eq("slug", d.slug)
      .eq("language_id", d.language_id);
  }

  bounce(PATH, "saved");
}

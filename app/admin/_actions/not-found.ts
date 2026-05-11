"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asStr, bounce } from "./_shared";

const PATH = "/admin/not-found";

export async function createNotFoundSlugAction(formData: FormData) {
  await requireAdmin();
  const slug = asStr(formData.get("slug"));
  if (!slug) bounce(PATH, undefined, "slug_required");

  const supabase = createAdminClient();
  const { data: maxRow } = await supabase
    .from("not_found")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position =
    ((maxRow as { position: number | null } | null)?.position ?? -1) + 1;

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

  bounce(PATH, "created");
}

export async function deleteNotFoundSlugAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("delete") ?? formData.get("slug") ?? "");
  if (!slug) bounce(PATH);
  const supabase = createAdminClient();
  await supabase.from("not_found").delete().eq("slug", slug);
  bounce(PATH, "deleted");
}

export async function bulkUpdateNotFoundAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = { slug: string; language_id: number; value: string };
  const updates: Update[] = [];

  for (const [key, raw] of formData.entries()) {
    const m = key.match(/^notfound\[(.+?)\]\[lang_(\d+)\]$/);
    if (!m) continue;
    updates.push({
      slug: m[1],
      language_id: Number(m[2]),
      value: String(typeof raw === "string" ? raw : "").trim(),
    });
  }

  const slugs = Array.from(new Set(updates.map((u) => u.slug)));
  if (slugs.length === 0) bounce(PATH, "saved");

  const { data: existing } = await supabase
    .from("not_found")
    .select("id, slug, language_id, position")
    .in("slug", slugs);

  const existingMap = new Map<
    string,
    { id: number; position: number | null }
  >();
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
    const ex = existingMap.get(key);
    if (!u.value) {
      if (ex) await supabase.from("not_found").delete().eq("id", ex.id);
    } else if (ex) {
      await supabase.from("not_found").update({ value: u.value }).eq("id", ex.id);
    } else {
      await supabase
        .from("not_found")
        .insert({
          slug: u.slug,
          value: u.value,
          language_id: u.language_id,
          position: nextPos++,
        });
    }
  }

  bounce(PATH, "saved");
}

"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import {
  uploadImage,
  deleteImage,
  pathFromPublicUrl,
} from "@/utils/storage/upload";
import { asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/identity";

export async function updateIdentityAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const name = asStr(formData.get("name")) || "Riccardo Ricciardi";
  const email = asNullableStr(formData.get("email"));
  const primary_cta_href = asNullableStr(formData.get("primary_cta_href"));
  const secondary_cta_href = asNullableStr(formData.get("secondary_cta_href"));

  const { error } = await supabase
    .from("site_identity")
    .upsert(
      {
        id: 1,
        name,
        email,
        primary_cta_href,
        secondary_cta_href,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "saved");
}

export async function bulkUpdateHeroContentAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = { slug: string; language_id: number; value: string };
  const updates: Update[] = [];

  for (const [key, raw] of formData.entries()) {
    const m = key.match(/^hero\[(.+?)\]\[lang_(\d+)\]$/);
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

export async function uploadProfilePhotoAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) bounce(PATH, undefined, "no_file");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_identity")
    .select("profile_photo_url")
    .eq("id", 1)
    .maybeSingle();
  const row = data as { profile_photo_url: string | null } | null;

  try {
    const { url } = await uploadImage(file as File, {
      folder: "identity",
      basename: "profile",
    });
    await supabase
      .from("site_identity")
      .upsert({ id: 1, profile_photo_url: url }, { onConflict: "id" });

    if (row?.profile_photo_url) {
      const oldPath = pathFromPublicUrl(row.profile_photo_url);
      if (oldPath) await deleteImage(oldPath);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upload_failed";
    bounce(PATH, undefined, encodeURIComponent(msg));
  }

  bounce(PATH, "uploaded");
}

export async function clearProfilePhotoAction() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_identity")
    .select("profile_photo_url")
    .eq("id", 1)
    .maybeSingle();
  const row = data as { profile_photo_url: string | null } | null;

  await supabase
    .from("site_identity")
    .update({ profile_photo_url: null })
    .eq("id", 1);
  if (row?.profile_photo_url) {
    const p = pathFromPublicUrl(row.profile_photo_url);
    if (p) await deleteImage(p);
  }

  bounce(PATH, "cleared");
}

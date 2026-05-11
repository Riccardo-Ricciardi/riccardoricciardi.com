"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asStr, bounce } from "./_shared";

const PATH = "/admin/navbar";

export async function createNavbarSlugAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = asStr(formData.get("slug")).toLowerCase();
  const { data: langsData } = await supabase
    .from("languages")
    .select("id, code")
    .order("id", { ascending: true });
  const langs = (langsData ?? []) as Array<{ id: number; code: string }>;

  const { data: maxRow } = await supabase
    .from("navbar")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position =
    ((maxRow as { position: number | null } | null)?.position ?? -1) + 1;

  const inserts: Array<{
    slug: string;
    value: string;
    language_id: number;
    position: number;
  }> = [];

  let any = false;
  for (const lang of langs) {
    const value = asStr(formData.get(`label_${lang.code}`));
    if (value) {
      any = true;
      inserts.push({ slug, value, language_id: lang.id, position });
    }
  }

  if (!any) bounce(PATH, undefined, "at_least_one_label_required");

  const { error } = await supabase.from("navbar").insert(inserts);
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function deleteNavbarSlugAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("delete") ?? formData.get("slug") ?? "");
  const supabase = createAdminClient();
  await supabase.from("navbar").delete().eq("slug", slug);
  bounce(PATH, "deleted");
}

export async function bulkUpdateNavbarAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Group = {
    newSlug: string;
    values: Map<number, string>;
  };
  const groups = new Map<string, Group>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^nav\[(.+?)\]\[(\w+)\](?:\[(\d+)\])?$/);
    if (!m) continue;
    const oldSlug = m[1];
    const field = m[2];
    const langId = m[3];
    const g = groups.get(oldSlug) ?? { newSlug: oldSlug, values: new Map() };
    if (field === "slug") g.newSlug = value.trim();
    else if (field === "value" && langId) g.values.set(Number(langId), value);
    groups.set(oldSlug, g);
  }

  for (const [oldSlug, g] of groups) {
    const { data: existing } = await supabase
      .from("navbar")
      .select("id, language_id")
      .eq("slug", oldSlug);
    const byLang = new Map(
      ((existing ?? []) as Array<{ id: number; language_id: number }>).map(
        (r) => [r.language_id, r.id]
      )
    );

    for (const [langId, raw] of g.values) {
      const trimmed = raw.trim();
      const existingId = byLang.get(langId);
      if (trimmed) {
        if (existingId !== undefined) {
          await supabase
            .from("navbar")
            .update({ slug: g.newSlug, value: trimmed })
            .eq("id", existingId);
        } else {
          await supabase.from("navbar").insert({
            slug: g.newSlug,
            value: trimmed,
            language_id: langId,
            position: 0,
          });
        }
      } else if (existingId !== undefined) {
        await supabase.from("navbar").delete().eq("id", existingId);
      }
    }
  }

  const order = String(formData.get("order") ?? "");
  if (order) {
    const slugs = order.split(",").map((s) => s.trim()).filter(Boolean);
    for (let i = 0; i < slugs.length; i++) {
      await supabase.from("navbar").update({ position: i }).eq("slug", slugs[i]);
    }
  }

  bounce(PATH, "saved");
}

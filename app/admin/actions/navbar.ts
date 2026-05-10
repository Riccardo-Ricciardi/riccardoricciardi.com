"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { parseMove } from "./_lib/move";

export async function createNavbarAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const language_id = Number(formData.get("language_id"));

  if (!value) redirect("/admin/navbar?error=label_required");

  let position = 0;
  const { data: existing } = await supabase
    .from("navbar")
    .select("position")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  const existingPos = (existing as { position: number | null } | null)
    ?.position;
  if (existingPos !== undefined && existingPos !== null) {
    position = existingPos;
  } else {
    const { data: maxRow } = await supabase
      .from("navbar")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const maxPos =
      (maxRow as { position: number | null } | null)?.position ?? -1;
    position = maxPos + 1;
  }

  const { error } = await supabase.from("navbar").insert({
    slug,
    value,
    language_id,
    position,
  });
  if (error)
    redirect(`/admin/navbar?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/navbar?ok=created");
}

export async function createNavbarMultilangAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();

  const { data: langsData } = await supabase
    .from("languages")
    .select("id, code")
    .order("id", { ascending: true });
  const langs = (langsData ?? []) as Array<{ id: number; code: string }>;

  const inserts: Array<{
    slug: string;
    value: string;
    language_id: number;
    position: number;
  }> = [];

  let position = 0;
  const { data: existing } = await supabase
    .from("navbar")
    .select("position")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  const existingPos = (existing as { position: number | null } | null)
    ?.position;
  if (existingPos !== undefined && existingPos !== null) {
    position = existingPos;
  } else {
    const { data: maxRow } = await supabase
      .from("navbar")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const maxPos =
      (maxRow as { position: number | null } | null)?.position ?? -1;
    position = maxPos + 1;
  }

  for (const lang of langs) {
    const value = String(formData.get(`label_${lang.code}`) ?? "").trim();
    if (value) {
      inserts.push({ slug, value, language_id: lang.id, position });
    }
  }

  if (inserts.length === 0) {
    redirect("/admin/navbar?error=at_least_one_label_required");
  }

  const { error } = await supabase.from("navbar").insert(inserts);
  if (error)
    redirect(`/admin/navbar?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/navbar?ok=saved");
}

export async function updateNavbarAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = Number(formData.get("id"));
  const slug = String(formData.get("slug") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const position = Number(formData.get("position") ?? 0);

  const { error } = await supabase
    .from("navbar")
    .update({ slug, value, position })
    .eq("id", id);
  if (error)
    redirect(`/admin/navbar?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/navbar?ok=saved");
}

export async function deleteNavbarAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("navbar").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/navbar?ok=deleted");
}

export async function deleteNavbarSlugAction(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("delete") ?? formData.get("slug") ?? "";
  const slug = String(raw);
  const supabase = createAdminClient();
  await supabase.from("navbar").delete().eq("slug", slug);
  revalidatePath("/", "layout");
  redirect("/admin/navbar?ok=deleted");
}

export async function moveNavbarSlugAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseMove(formData);
  if (!parsed) redirect("/admin/navbar");
  const slug = parsed!.id;
  const direction = parsed!.direction;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("navbar")
    .select("id, slug, position")
    .order("position", { ascending: true });

  type Row = { id: number; slug: string | null; position: number | null };
  const rows = (data ?? []) as Row[];

  const seen = new Set<string>();
  const slugOrder: string[] = [];
  for (const r of rows) {
    const s = r.slug ?? "";
    if (!seen.has(s)) {
      seen.add(s);
      slugOrder.push(s);
    }
  }

  const idx = slugOrder.indexOf(slug);
  if (idx === -1) return;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= slugOrder.length) return;
  [slugOrder[idx], slugOrder[targetIdx]] = [
    slugOrder[targetIdx],
    slugOrder[idx],
  ];
  for (let i = 0; i < slugOrder.length; i++) {
    await supabase
      .from("navbar")
      .update({ position: i })
      .eq("slug", slugOrder[i]);
  }

  revalidatePath("/", "layout");
  redirect("/admin/navbar");
}

export async function bulkUpdateNavbarAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Group = {
    slug: string;
    position: number;
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

    const g = groups.get(oldSlug) ?? {
      slug: oldSlug,
      position: 0,
      values: new Map<number, string>(),
    };
    if (field === "slug") g.slug = value.trim();
    else if (field === "position") g.position = Number(value) || 0;
    else if (field === "value" && langId) g.values.set(Number(langId), value);
    groups.set(oldSlug, g);
  }

  for (const [oldSlug, g] of groups) {
    const { data: existing } = await supabase
      .from("navbar")
      .select("id, language_id")
      .eq("slug", oldSlug);

    const existingByLang = new Map(
      ((existing ?? []) as Array<{ id: number; language_id: number }>).map(
        (r) => [r.language_id, r.id]
      )
    );

    for (const [langId, raw] of g.values) {
      const trimmed = raw.trim();
      const existingId = existingByLang.get(langId);
      if (trimmed) {
        if (existingId !== undefined) {
          await supabase
            .from("navbar")
            .update({
              slug: g.slug,
              value: trimmed,
              position: g.position,
            })
            .eq("id", existingId);
        } else {
          await supabase.from("navbar").insert({
            slug: g.slug,
            value: trimmed,
            language_id: langId,
            position: g.position,
          });
        }
      } else if (existingId !== undefined) {
        await supabase.from("navbar").delete().eq("id", existingId);
      }
    }
  }

  revalidatePath("/", "layout");
  redirect("/admin/navbar?ok=saved");
}

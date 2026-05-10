"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { ADMIN_EMAILS, requireAdmin } from "@/utils/auth/admin";
import { uploadImage, deleteImage, pathFromPublicUrl } from "@/utils/storage/upload";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=missing_fields");
  }

  if (!ADMIN_EMAILS.includes(email)) {
    redirect("/admin/login?error=not_authorized");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------- IMAGES ----------------

export async function uploadSkillIconAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const variant = String(formData.get("variant") ?? "light");
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    redirect(`/admin/skills?error=no_file`);
  }

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("skills")
    .select("name, icon_url, icon_dark_url")
    .eq("id", id)
    .maybeSingle();

  const skill = row as { name: string; icon_url: string | null; icon_dark_url: string | null } | null;

  try {
    const { url } = await uploadImage(file as File, {
      folder: `skills/${id}`,
      basename: `${skill?.name ?? "skill"}-${variant}`,
    });

    const column = variant === "dark" ? "icon_dark_url" : "icon_url";
    const previousUrl = variant === "dark" ? skill?.icon_dark_url : skill?.icon_url;

    await supabase
      .from("skills")
      .update({ [column]: url })
      .eq("id", id);

    if (previousUrl) {
      const oldPath = pathFromPublicUrl(previousUrl);
      if (oldPath) await deleteImage(oldPath);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upload_failed";
    redirect(`/admin/skills?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/", "layout");
  redirect("/admin/skills");
}

export async function clearSkillIconAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const variant = String(formData.get("variant") ?? "light");

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("skills")
    .select("icon_url, icon_dark_url")
    .eq("id", id)
    .maybeSingle();

  const skill = row as { icon_url: string | null; icon_dark_url: string | null } | null;
  const column = variant === "dark" ? "icon_dark_url" : "icon_url";
  const url = variant === "dark" ? skill?.icon_dark_url : skill?.icon_url;

  await supabase.from("skills").update({ [column]: null }).eq("id", id);

  if (url) {
    const oldPath = pathFromPublicUrl(url);
    if (oldPath) await deleteImage(oldPath);
  }

  revalidatePath("/", "layout");
  redirect("/admin/skills");
}

export async function uploadProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    redirect(`/admin/projects?error=no_file`);
  }

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("projects")
    .select("repo, screenshot_url")
    .eq("id", id)
    .maybeSingle();

  const project = row as { repo: string; screenshot_url: string | null } | null;
  const safeRepo = project?.repo.replace("/", "-") ?? id;

  try {
    const { url } = await uploadImage(file as File, {
      folder: `projects/${id}`,
      basename: safeRepo,
    });

    await supabase.from("projects").update({ screenshot_url: url }).eq("id", id);

    if (project?.screenshot_url) {
      const oldPath = pathFromPublicUrl(project.screenshot_url);
      if (oldPath) await deleteImage(oldPath);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upload_failed";
    redirect(`/admin/projects?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/", "layout");
  redirect(`/admin/projects/${id}`);
}

export async function clearProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("projects")
    .select("screenshot_url")
    .eq("id", id)
    .maybeSingle();

  const project = row as { screenshot_url: string | null } | null;

  await supabase.from("projects").update({ screenshot_url: null }).eq("id", id);

  if (project?.screenshot_url) {
    const oldPath = pathFromPublicUrl(project.screenshot_url);
    if (oldPath) await deleteImage(oldPath);
  }

  revalidatePath("/", "layout");
  redirect(`/admin/projects/${id}`);
}

// ---------------- SKILLS ----------------

export async function createSkillAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  const position = Number(formData.get("position") ?? 0);
  const percentage = Number(formData.get("percentage") ?? 0);
  const dark = formData.get("dark") === "on";
  const category = String(formData.get("category") ?? "").trim() || null;

  if (!name) redirect("/admin/skills?error=name_required");

  const { error } = await supabase.from("skills").insert({
    name,
    position,
    percentage,
    dark,
    category,
  });
  if (error) redirect(`/admin/skills?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/skills");
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
  redirect("/admin/skills");
}

export async function deleteSkillAction(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("delete") ?? formData.get("id") ?? "";
  const id = Number(raw);
  if (!id) redirect("/admin/skills");
  const supabase = createAdminClient();
  await supabase.from("skills").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/skills");
}

async function swapPositions<T extends { id: number | string; position: number | null }>(
  table: "skills" | "projects",
  rows: T[],
  currentId: T["id"],
  direction: "up" | "down"
) {
  const supabase = createAdminClient();
  // Normalize: ensure positions are 0..N-1 sequential
  const sorted = [...rows].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );
  const idx = sorted.findIndex((r) => r.id === currentId);
  if (idx === -1) return;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= sorted.length) return;
  const a = sorted[idx];
  const b = sorted[targetIdx];
  await supabase.from(table).update({ position: targetIdx }).eq("id", a.id);
  await supabase.from(table).update({ position: idx }).eq("id", b.id);
  // Renumber other rows to keep sequential
  for (let i = 0; i < sorted.length; i++) {
    if (i === idx || i === targetIdx) continue;
    if ((sorted[i].position ?? 0) !== i) {
      await supabase.from(table).update({ position: i }).eq("id", sorted[i].id);
    }
  }
}

function parseMove(formData: FormData): { id: string; direction: "up" | "down" } | null {
  const move = String(formData.get("move") ?? "");
  if (move) {
    const colon = move.lastIndexOf(":");
    if (colon > 0) {
      const id = move.slice(0, colon);
      const dir = move.slice(colon + 1);
      if (dir === "up" || dir === "down") return { id, direction: dir };
    }
  }
  for (const k of formData.keys()) {
    const m = k.match(/^move:(.+):(up|down)$/);
    if (m) return { id: m[1], direction: m[2] as "up" | "down" };
  }
  const id = formData.get("id");
  const dir = formData.get("direction");
  if (id && (dir === "up" || dir === "down")) {
    return { id: String(id), direction: dir };
  }
  return null;
}

export async function moveSkillAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseMove(formData);
  if (!parsed) redirect("/admin/skills");
  const id = Number(parsed.id);
  const direction = parsed.direction;
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

export async function moveProjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseMove(formData);
  if (!parsed) redirect("/admin/projects");
  const id = parsed.id;
  const direction = parsed.direction;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("projects")
    .select("id, position")
    .order("position", { ascending: true });
  await swapPositions(
    "projects",
    (data ?? []) as Array<{ id: string; position: number | null }>,
    id,
    direction
  );
  revalidatePath("/", "layout");
  redirect("/admin/projects");
}

export async function moveNavbarSlugAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseMove(formData);
  if (!parsed) redirect("/admin/navbar");
  const slug = parsed.id;
  const direction = parsed.direction;
  const supabase = createAdminClient();

  // Get all rows ordered by position, group by slug
  const { data } = await supabase
    .from("navbar")
    .select("id, slug, position")
    .order("position", { ascending: true });

  type Row = { id: number; slug: string | null; position: number | null };
  const rows = (data ?? []) as Row[];

  // Build ordered list of unique slugs
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
  // Swap slugs in array
  [slugOrder[idx], slugOrder[targetIdx]] = [
    slugOrder[targetIdx],
    slugOrder[idx],
  ];
  // Renumber: for each slug in new order, set all its rows to that index
  for (let i = 0; i < slugOrder.length; i++) {
    await supabase
      .from("navbar")
      .update({ position: i })
      .eq("slug", slugOrder[i]);
  }

  revalidatePath("/", "layout");
  redirect("/admin/navbar");
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

  // Track which skill IDs have a `dark` checkbox in the form. Unchecked
  // checkboxes are NOT submitted, so we need a hidden marker per row.
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

export async function bulkUpdateProjectsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = { position?: number; visible?: boolean };
  const updates = new Map<string, Update>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^project\[([^\]]+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = m[1];
    const field = m[2];
    const u = updates.get(id) ?? {};
    if (field === "position") u.position = Number(value) || 0;
    else if (field === "visible") u.visible = value === "on" || value === "true";
    updates.set(id, u);
  }

  const rowIds = new Set<string>();
  for (const k of formData.keys()) {
    const m = k.match(/^project\[([^\]]+)\]\[__row\]$/);
    if (m) rowIds.add(m[1]);
  }

  for (const id of rowIds) {
    const u = updates.get(id) ?? {};
    if (!("visible" in u)) u.visible = false;
    if (Object.keys(u).length === 0) continue;
    await supabase.from("projects").update(u).eq("id", id);
  }

  revalidatePath("/", "layout");
  redirect("/admin/projects?ok=saved");
}

// ---------------- PROJECTS ----------------

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const repo = String(formData.get("repo") ?? "").trim();
  const position = Number(formData.get("position") ?? 0);
  const visible = formData.get("visible") === "on";

  if (!repo) redirect("/admin/projects?error=repo_required");

  const { error } = await supabase.from("projects").insert({
    repo,
    position,
    visible,
  });
  if (error) redirect(`/admin/projects?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/projects");
}

export async function updateProjectAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = String(formData.get("id"));
  const position = Number(formData.get("position") ?? 0);
  const visible = formData.get("visible") === "on";

  const { error } = await supabase
    .from("projects")
    .update({ position, visible })
    .eq("id", id);
  if (error) redirect(`/admin/projects?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/projects");
}

export async function upsertProjectI18nAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const project_id = String(formData.get("project_id"));
  const language_id = Number(formData.get("language_id"));
  const description = String(formData.get("description") ?? "").trim();

  if (!description) {
    await supabase
      .from("projects_i18n")
      .delete()
      .eq("project_id", project_id)
      .eq("language_id", language_id);
  } else {
    await supabase.from("projects_i18n").upsert(
      { project_id, language_id, description },
      { onConflict: "project_id,language_id" }
    );
  }

  revalidatePath("/", "layout");
  redirect(`/admin/projects/${project_id}`);
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("delete") ?? formData.get("id") ?? "";
  const id = String(raw);
  if (!id) redirect("/admin/projects");
  const supabase = createAdminClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/projects");
}

// ---------------- NAVBAR ----------------

export async function createNavbarAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const language_id = Number(formData.get("language_id"));
  const position = Number(formData.get("position") ?? 0);

  if (!value) redirect("/admin/navbar?error=label_required");

  const { error } = await supabase.from("navbar").insert({
    slug,
    value,
    language_id,
    position,
  });
  if (error) redirect(`/admin/navbar?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/navbar");
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
  if (error) redirect(`/admin/navbar?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/navbar");
}

export async function deleteNavbarAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("navbar").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/navbar");
}

export async function deleteNavbarSlugAction(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("delete") ?? formData.get("slug") ?? "";
  const slug = String(raw);
  const supabase = createAdminClient();
  await supabase.from("navbar").delete().eq("slug", slug);
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

// ---------------- LANGUAGES ----------------

export async function cloneLanguageAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const source_code = String(formData.get("source_code") ?? "en").trim();
  const target_code = String(formData.get("target_code") ?? "").trim().toLowerCase();
  const target_name = String(formData.get("target_name") ?? "").trim();

  if (!target_code || !target_name) {
    redirect("/admin/languages?error=fields_required");
  }

  const { error } = await supabase.rpc("clone_language", {
    source_code,
    target_code,
    target_name,
  });
  if (error) redirect(`/admin/languages?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/languages");
}

export async function deleteLanguageAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("languages").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/languages");
}

// ---------------- THEME ----------------

export async function updateThemeAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const key = String(formData.get("key") ?? "");
  const value_light = String(formData.get("value_light") ?? "").trim();
  const value_dark = String(formData.get("value_dark") ?? "").trim() || null;

  if (!key || !value_light) {
    redirect("/admin/theme?error=fields_required");
  }

  const { error } = await supabase
    .from("theme_settings")
    .update({ value_light, value_dark, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) redirect(`/admin/theme?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/theme");
}

// ---------------- CONTENT ----------------

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
  redirect("/admin/content");
}

export async function createContentSlugAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/content?error=slug_required");

  // Insert empty rows for each language so the UI shows a row per locale
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
  redirect("/admin/content");
}

export async function deleteContentSlugAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const supabase = createAdminClient();
  await supabase.from("content_blocks").delete().eq("slug", slug);
  revalidatePath("/", "layout");
  redirect("/admin/content");
}

export async function triggerSyncAction() {
  await requireAdmin();
  const cronSecret = process.env.CRON_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!cronSecret || !siteUrl) return;

  await fetch(`${siteUrl}/api/cron/sync-github`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  }).catch(() => {});

  revalidatePath("/", "layout");
  redirect("/admin/projects");
}

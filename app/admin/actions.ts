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
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("skills").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/skills");
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
  const id = String(formData.get("id"));
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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import {
  uploadImage,
  deleteImage,
  pathFromPublicUrl,
} from "@/utils/storage/upload";

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

  const skill = row as
    | { name: string; icon_url: string | null; icon_dark_url: string | null }
    | null;

  try {
    const { url } = await uploadImage(file as File, {
      folder: `skills/${id}`,
      basename: `${skill?.name ?? "skill"}-${variant}`,
    });

    const column = variant === "dark" ? "icon_dark_url" : "icon_url";
    const previousUrl =
      variant === "dark" ? skill?.icon_dark_url : skill?.icon_url;

    const update: Record<string, string | boolean> = { [column]: url };
    if (variant === "dark") update.dark = true;

    await supabase.from("skills").update(update).eq("id", id);

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

  const skill = row as
    | { icon_url: string | null; icon_dark_url: string | null }
    | null;
  const column = variant === "dark" ? "icon_dark_url" : "icon_url";
  const url = variant === "dark" ? skill?.icon_dark_url : skill?.icon_url;

  const update: Record<string, string | boolean | null> = { [column]: null };
  if (variant === "dark") update.dark = false;

  await supabase.from("skills").update(update).eq("id", id);

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

  const project = row as
    | { repo: string; screenshot_url: string | null }
    | null;
  const safeRepo = project?.repo.replace("/", "-") ?? id;

  try {
    const { url } = await uploadImage(file as File, {
      folder: `projects/${id}`,
      basename: safeRepo,
    });

    await supabase
      .from("projects")
      .update({ screenshot_url: url })
      .eq("id", id);

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

  await supabase
    .from("projects")
    .update({ screenshot_url: null })
    .eq("id", id);

  if (project?.screenshot_url) {
    const oldPath = pathFromPublicUrl(project.screenshot_url);
    if (oldPath) await deleteImage(oldPath);
  }

  revalidatePath("/", "layout");
  redirect(`/admin/projects/${id}`);
}

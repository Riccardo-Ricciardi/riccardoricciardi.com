"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";

export async function cloneLanguageAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const source_code = String(formData.get("source_code") ?? "en").trim();
  const target_code = String(formData.get("target_code") ?? "")
    .trim()
    .toLowerCase();
  const target_name = String(formData.get("target_name") ?? "").trim();

  if (!target_code || !target_name) {
    redirect("/admin/languages?error=fields_required");
  }

  const { error } = await supabase.rpc("clone_language", {
    source_code,
    target_code,
    target_name,
  });
  if (error)
    redirect(`/admin/languages?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/languages?ok=created");
}

export async function deleteLanguageAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("languages").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/languages?ok=deleted");
}

export async function renameLanguageAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = Number(formData.get("id"));
  const code = String(formData.get("code") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!id || !code || !name) {
    redirect("/admin/languages?error=fields_required");
  }

  if (!/^[a-z]{2}([_-][a-z0-9]+)?$/i.test(code)) {
    redirect("/admin/languages?error=invalid_code");
  }

  const { error } = await supabase
    .from("languages")
    .update({ code, name })
    .eq("id", id);
  if (error)
    redirect(`/admin/languages?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/admin/languages?ok=updated");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";

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
  redirect("/admin/theme?ok=saved");
}

"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asInt, asStr, bounce } from "./_shared";

const PATH = "/admin/languages";

export async function cloneLanguageAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const source_code = asStr(formData.get("source_code")) || "en";
  const target_code = asStr(formData.get("target_code")).toLowerCase();
  const target_name = asStr(formData.get("target_name"));

  if (!target_code || !target_name) {
    bounce(PATH, undefined, "fields_required");
  }
  if (!/^[a-z]{2}([_-][a-z0-9]+)?$/i.test(target_code)) {
    bounce(PATH, undefined, "invalid_code");
  }

  const { error } = await supabase.rpc("clone_language", {
    source_code,
    target_code,
    target_name,
  });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function renameLanguageAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = asInt(formData.get("id"));
  const code = asStr(formData.get("code")).toLowerCase();
  const name = asStr(formData.get("name"));
  if (!id || !code || !name) bounce(PATH, undefined, "fields_required");
  if (!/^[a-z]{2}([_-][a-z0-9]+)?$/i.test(code)) {
    bounce(PATH, undefined, "invalid_code");
  }

  const { error } = await supabase
    .from("languages")
    .update({ code, name })
    .eq("id", id);
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "saved");
}

export async function deleteLanguageAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("delete") ?? formData.get("id"));
  if (!id) bounce(PATH);
  const supabase = createAdminClient();
  await supabase.from("languages").delete().eq("id", id);
  bounce(PATH, "deleted");
}

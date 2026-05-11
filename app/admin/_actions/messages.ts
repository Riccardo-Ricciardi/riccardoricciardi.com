"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asInt, bounce } from "./_shared";

const PATH = "/admin/messages";

export async function markMessageReadAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("id"));
  if (!id) bounce(PATH);
  const supabase = createAdminClient();
  await supabase
    .from("contact_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  bounce(PATH, "saved");
}

export async function markMessageUnreadAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("id"));
  if (!id) bounce(PATH);
  const supabase = createAdminClient();
  await supabase
    .from("contact_messages")
    .update({ read_at: null })
    .eq("id", id);
  bounce(PATH, "saved");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("delete") ?? formData.get("id"));
  if (!id) bounce(PATH);
  const supabase = createAdminClient();
  await supabase.from("contact_messages").delete().eq("id", id);
  bounce(PATH, "deleted");
}

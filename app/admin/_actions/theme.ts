"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { bounce } from "./_shared";

const PATH = "/admin/theme";

export async function bulkUpdateThemeAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = { value_light?: string; value_dark?: string | null };
  const updates = new Map<string, Update>();
  const rowKeys = new Set<string>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^theme\[(.+?)\]\[(\w+)\]$/);
    if (!m) continue;
    const tokenKey = m[1];
    const field = m[2];
    if (field === "__row") {
      rowKeys.add(tokenKey);
      continue;
    }
    const u = updates.get(tokenKey) ?? {};
    if (field === "value_light") u.value_light = value.trim();
    else if (field === "value_dark") u.value_dark = value.trim() || null;
    updates.set(tokenKey, u);
  }

  const now = new Date().toISOString();
  for (const k of rowKeys) {
    const u = updates.get(k);
    if (!u) continue;
    await supabase
      .from("theme_settings")
      .update({ ...u, updated_at: now })
      .eq("key", k);
  }

  bounce(PATH, "saved");
}

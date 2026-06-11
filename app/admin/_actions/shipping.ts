"use server";

import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asInt, asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/shipping";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

export async function createShippingEntryAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const dateParsed = dateSchema.safeParse(asStr(formData.get("happened_on")));
  if (!dateParsed.success) bounce(PATH, undefined, "date_required");
  const happened_on = dateParsed.data;

  const { data: maxRow } = await supabase
    .from("shipping_log")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;

  const { error } = await supabase.from("shipping_log").insert({
    happened_on,
    visible: true,
    position: maxPos + 1,
  });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function deleteShippingEntryAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("delete") ?? formData.get("id"));
  if (!id) bounce(PATH);
  const supabase = createAdminClient();
  await supabase.from("shipping_log").delete().eq("id", id);
  bounce(PATH, "deleted");
}

export async function bulkUpdateShippingAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = {
    happened_on?: string;
    visible?: boolean;
  };
  const updates = new Map<number, Update>();
  const rowIds = new Set<number>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^ship\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = Number(m[1]);
    const field = m[2];
    if (field === "__row") {
      rowIds.add(id);
      continue;
    }
    const u = updates.get(id) ?? {};
    if (field === "happened_on") {
      const parsed = dateSchema.safeParse(value.trim());
      if (parsed.success) u.happened_on = parsed.data;
    } else if (field === "visible") {
      u.visible = value === "on" || value === "true";
    }
    updates.set(id, u);
  }

  await Promise.all(
    Array.from(rowIds).map((id) => {
      const u = updates.get(id) ?? {};
      if (!("visible" in u)) u.visible = false;
      return supabase.from("shipping_log").update(u).eq("id", id);
    }),
  );

  bounce(PATH, "saved");
}

export async function upsertShippingI18nAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const log_id = asInt(formData.get("log_id"));
  const language_id = asInt(formData.get("language_id"));
  const body = asNullableStr(formData.get("body"));

  if (!log_id || !language_id) bounce(PATH);

  if (!body) {
    await supabase
      .from("shipping_log_i18n")
      .delete()
      .eq("log_id", log_id)
      .eq("language_id", language_id);
  } else {
    await supabase.from("shipping_log_i18n").upsert(
      { log_id, language_id, body },
      { onConflict: "log_id,language_id" }
    );
  }

  bounce(PATH, "saved");
}

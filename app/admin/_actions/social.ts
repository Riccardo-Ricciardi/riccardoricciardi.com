"use server";

import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { asInt, asNullableStr, asStr, bounce } from "./_shared";

const PATH = "/admin/contact";

const kindSchema = z
  .string()
  .min(1)
  .max(32)
  .regex(/^[a-z0-9_-]+$/, "kind must be lowercase alphanumeric");

const labelSchema = z.string().max(60);

const urlSchema = z
  .string()
  .min(1)
  .max(500)
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:";
      } catch {
        return false;
      }
    },
    { message: "url must be http(s) or mailto" }
  );

export async function createSocialLinkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const kindParsed = kindSchema.safeParse(asStr(formData.get("kind")) || "custom");
  if (!kindParsed.success) bounce(PATH, undefined, "invalid_kind");
  const kind = kindParsed.data;

  const labelRaw = asNullableStr(formData.get("label"));
  let label: string | null = null;
  if (labelRaw !== null) {
    const labelParsed = labelSchema.safeParse(labelRaw);
    if (!labelParsed.success) bounce(PATH, undefined, "label_too_long");
    label = labelParsed.data;
  }

  const urlParsed = urlSchema.safeParse(asStr(formData.get("url")));
  if (!urlParsed.success) bounce(PATH, undefined, "invalid_url");
  const url = urlParsed.data;

  const { data: maxRow } = await supabase
    .from("social_links")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const maxPos = (maxRow as { position: number | null } | null)?.position ?? -1;

  const { error } = await supabase.from("social_links").insert({
    kind,
    label,
    url,
    visible: true,
    position: maxPos + 1,
  });
  if (error) bounce(PATH, undefined, encodeURIComponent(error.message));

  bounce(PATH, "created");
}

export async function deleteSocialLinkAction(formData: FormData) {
  await requireAdmin();
  const id = asInt(formData.get("delete") ?? formData.get("id"));
  if (!id) bounce(PATH);
  const supabase = createAdminClient();
  await supabase.from("social_links").delete().eq("id", id);
  bounce(PATH, "deleted");
}

export async function bulkUpdateSocialAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  type Update = {
    kind?: string;
    label?: string | null;
    url?: string;
    visible?: boolean;
  };
  const updates = new Map<number, Update>();
  const rowIds = new Set<number>();

  for (const [key, raw] of formData.entries()) {
    const value = typeof raw === "string" ? raw : "";
    const m = key.match(/^social\[(\d+)\]\[(\w+)\]$/);
    if (!m) continue;
    const id = Number(m[1]);
    const field = m[2];
    if (field === "__row") {
      rowIds.add(id);
      continue;
    }
    const u = updates.get(id) ?? {};
    if (field === "kind") {
      const k = kindSchema.safeParse(value.trim());
      if (k.success) u.kind = k.data;
    } else if (field === "label") {
      const trimmed = value.trim();
      if (trimmed.length === 0) u.label = null;
      else {
        const l = labelSchema.safeParse(trimmed);
        if (l.success) u.label = l.data;
      }
    } else if (field === "url") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        const parsed = urlSchema.safeParse(trimmed);
        if (parsed.success) u.url = parsed.data;
      }
    } else if (field === "visible") {
      u.visible = value === "on" || value === "true";
    }
    updates.set(id, u);
  }

  const now = new Date().toISOString();
  for (const id of rowIds) {
    const u = updates.get(id) ?? {};
    if (!("visible" in u)) u.visible = false;
    if (Object.keys(u).length === 0) continue;
    await supabase
      .from("social_links")
      .update({ ...u, updated_at: now })
      .eq("id", id);
  }

  const order = String(formData.get("order") ?? "");
  if (order) {
    const ids = order
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    await Promise.all(
      ids.map((id, index) =>
        supabase.from("social_links").update({ position: index }).eq("id", id)
      )
    );
  }

  bounce(PATH, "saved");
}

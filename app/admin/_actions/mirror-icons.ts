"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { getSupabaseImageUrl } from "@/utils/env";
import { bounce } from "./_shared";

const BUCKET = "image";
const FOLDER = "icons";
const PATH = "/admin/skills";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\+\+/g, "pp")
    .replace(/\.js$/, "js")
    .replace(/#/g, "sharp")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchSvg(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; riccardoricciardi.com icon mirror)",
      Accept: "image/svg+xml,*/*;q=0.8",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `fetch ${url} -> HTTP ${res.status} ${res.statusText} ${body.slice(0, 120)}`
    );
  }
  const text = await res.text();
  if (!text.includes("<svg")) throw new Error(`fetched body is not SVG: ${url}`);
  return text;
}

async function mirrorOne(
  supabase: ReturnType<typeof createAdminClient>,
  selfHost: string,
  name: string,
  variant: "light" | "dark",
  sourceUrl: string | null
): Promise<string | null> {
  if (!sourceUrl) return null;
  if (sourceUrl.includes(selfHost)) return sourceUrl;
  const slug = slugify(name);
  const filename = variant === "dark" ? `${slug}-dark.svg` : `${slug}.svg`;
  const path = `${FOLDER}/${filename}`;
  const svg = await fetchSvg(sourceUrl);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: "image/svg+xml",
      upsert: true,
      cacheControl: "31536000",
    });
  if (error) {
    throw new Error(
      `upload ${path}: ${error.message} (cause=${(error as { cause?: string }).cause ?? "n/a"})`
    );
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

interface RowLike {
  id: number;
  name: string;
  icon_url: string | null;
  icon_dark_url: string | null;
}

async function mirrorSkills(
  supabase: ReturnType<typeof createAdminClient>,
  selfHost: string
): Promise<{ ok: number; failed: number; skipped: number }> {
  const { data, error } = await supabase
    .from("skills")
    .select("id, name, icon_url, icon_dark_url");
  if (error) throw new Error(`Select skills: ${error.message}`);

  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of (data ?? []) as RowLike[]) {
    const updates: { icon_url?: string; icon_dark_url?: string } = {};
    try {
      const light = await mirrorOne(supabase, selfHost, row.name, "light", row.icon_url);
      if (light && light !== row.icon_url) updates.icon_url = light;
      const dark = await mirrorOne(supabase, selfHost, row.name, "dark", row.icon_dark_url);
      if (dark && dark !== row.icon_dark_url) updates.icon_dark_url = dark;

      if (Object.keys(updates).length === 0) {
        skipped += 1;
        continue;
      }
      const { error: upErr } = await supabase
        .from("skills")
        .update(updates)
        .eq("id", row.id);
      if (upErr) throw new Error(`Update skills#${row.id}: ${upErr.message}`);
      ok += 1;
    } catch (err) {
      console.error(`mirror skills#${row.id} (${row.name}):`, err);
      failed += 1;
    }
  }
  return { ok, failed, skipped };
}

async function mirrorUses(
  supabase: ReturnType<typeof createAdminClient>,
  selfHost: string
): Promise<{ ok: number; failed: number; skipped: number }> {
  const { data, error } = await supabase
    .from("uses_items")
    .select("id, name, icon_url");
  if (error) throw new Error(`Select uses_items: ${error.message}`);

  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of (data ?? []) as { id: number; name: string; icon_url: string | null }[]) {
    try {
      const light = await mirrorOne(supabase, selfHost, row.name, "light", row.icon_url);
      if (!light || light === row.icon_url) {
        skipped += 1;
        continue;
      }
      const { error: upErr } = await supabase
        .from("uses_items")
        .update({ icon_url: light })
        .eq("id", row.id);
      if (upErr) throw new Error(`Update uses_items#${row.id}: ${upErr.message}`);
      ok += 1;
    } catch (err) {
      console.error(`mirror uses_items#${row.id} (${row.name}):`, err);
      failed += 1;
    }
  }
  return { ok, failed, skipped };
}

export async function mirrorIconsAction(_formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const selfHost = new URL(getSupabaseImageUrl()).host;

  let total = { ok: 0, failed: 0, skipped: 0 };
  try {
    const a = await mirrorSkills(supabase, selfHost);
    const b = await mirrorUses(supabase, selfHost);
    total = {
      ok: a.ok + b.ok,
      failed: a.failed + b.failed,
      skipped: a.skipped + b.skipped,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "mirror_failed";
    bounce(PATH, undefined, encodeURIComponent(msg));
  }

  bounce(PATH, `mirror_${total.ok}ok_${total.failed}fail_${total.skipped}skip`);
}

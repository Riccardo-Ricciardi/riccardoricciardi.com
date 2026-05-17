#!/usr/bin/env node
// One-shot: download every external SVG icon referenced by skills + uses_items,
// upload to Supabase storage `image/icons/`, then rewrite icon_url columns to
// point at the Supabase CDN.
//
// Run: node scripts/upload-icons.mjs

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const eq = line.indexOf("=");
  const key = line.slice(0, eq).trim();
  let val = line.slice(eq + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "image";
const FOLDER = "icons";

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\+\+/g, "pp")
    .replace(/\.js$/, "js")
    .replace(/#/g, "sharp")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchSvg(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 icon-mirror" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  const text = await res.text();
  if (!text.includes("<svg")) throw new Error(`Not an SVG: ${url}`);
  return text;
}

async function uploadIcon(name, variant, sourceUrl) {
  if (!sourceUrl) return null;
  if (sourceUrl.includes(SUPABASE_URL)) return sourceUrl;
  const slug = slugify(name);
  const filename = variant === "dark" ? `${slug}-dark.svg` : `${slug}.svg`;
  const path = `${FOLDER}/${filename}`;
  const svg = await fetchSvg(sourceUrl);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/svg+xml",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`Upload ${path}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function processTable(table, key, { hasDark = true } = {}) {
  const cols = hasDark
    ? `${key}, name, icon_url, icon_dark_url`
    : `${key}, name, icon_url`;
  const { data, error } = await supabase.from(table).select(cols);
  if (error) throw new Error(`Select ${table}: ${error.message}`);

  for (const row of data ?? []) {
    const updates = {};
    try {
      if (row.icon_url) {
        const url = await uploadIcon(row.name, "light", row.icon_url);
        if (url && url !== row.icon_url) updates.icon_url = url;
      }
      if (hasDark && row.icon_dark_url) {
        const url = await uploadIcon(row.name, "dark", row.icon_dark_url);
        if (url && url !== row.icon_dark_url) updates.icon_dark_url = url;
      }
      if (Object.keys(updates).length === 0) {
        console.log(`  skip  ${row.name} (already mirrored or no icons)`);
        continue;
      }
      const { error: upErr } = await supabase
        .from(table)
        .update(updates)
        .eq(key, row[key]);
      if (upErr) throw new Error(`Update ${table}#${row[key]}: ${upErr.message}`);
      console.log(`  ok    ${row.name}`);
    } catch (err) {
      console.warn(`  fail  ${row.name}: ${err.message}`);
    }
  }
}

console.log("Skills:");
await processTable("skills", "id", { hasDark: true });
console.log("Uses items:");
await processTable("uses_items", "id", { hasDark: false });
console.log("Done.");

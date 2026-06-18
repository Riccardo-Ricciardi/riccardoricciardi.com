#!/usr/bin/env node
// One-shot: swap 8 icons for higher-quality / more-popular badges (user request).
//   C -> official ISO-C medallion, Docker -> modern Moby whale, Gemini -> gradient
//   spark, HTML -> HTML5 shield, Illustrator -> modern Ai, Nginx -> official mark,
//   Linux -> canonical Wikimedia Tux, Claude Code (uses_items) -> the Clawd robot.
// Same storage filenames -> upsert; icon_url cache-bust handled by the SQL migration.
// Run: node scripts/swap-skill-icons.mjs

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

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

const ICONS = [
  { path: "icons/c.svg",           src: "https://api.iconify.design/logos/c.svg" },
  { path: "icons/docker.svg",      src: "https://api.iconify.design/logos/docker-icon.svg" },
  { path: "icons/gemini.svg",      src: "https://api.iconify.design/simple-icons/googlegemini.svg?color=%231C69FF" },
  { path: "icons/html.svg",        src: "https://api.iconify.design/logos/html-5.svg" },
  { path: "icons/illustrator.svg", src: "https://api.iconify.design/logos/adobe-illustrator.svg" },
  { path: "icons/nginx.svg",       src: "https://api.iconify.design/logos/nginx.svg" },
  { path: "icons/claude-code.svg", src: "https://api.iconify.design/cbi/claude-clawd.svg?color=%23D97757" },
  { path: "icons/linux.svg",       src: "https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg" },
];

async function fetchSvg(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 icon-swap" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  const text = await res.text();
  if (!text.includes("<svg")) throw new Error(`Not an SVG: ${url}`);
  return text;
}

let failed = 0;
console.log("Uploading icons:");
for (const { path, src } of ICONS) {
  try {
    const svg = await fetchSvg(src);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: "image/svg+xml",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw new Error(error.message);
    console.log(`  ok    ${path} (${svg.length} B)`);
  } catch (err) {
    failed += 1;
    console.warn(`  fail  ${path}: ${err.message}`);
  }
}

console.log(failed ? `Done with ${failed} failure(s).` : "Done.");
process.exit(failed ? 1 : 0);

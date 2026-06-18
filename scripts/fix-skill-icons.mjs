#!/usr/bin/env node
// One-shot cleanup: fix wrong/bloated skill icons and remove legacy root PNGs.
//  - C showed the C++ logo (c.svg == cpp.svg) -> upload real C icon
//  - 3D Printing showed the Bambu Lab brand logo -> neutral 3D-print icon
//  - linux.svg was a 189 KB raster blob -> lean vector Tux
//  - CSS / Astro / Groq had no icon -> upload proper SVGs
//  - delete stale capitalised root *.png (superseded by icons/*.svg), keep Logo.png
//
// DB columns (icon_url + positions) are handled by the SQL migration, not here.
// Run: node scripts/fix-skill-icons.mjs

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

// Corrected / new icons. path is relative to the bucket root.
const ICONS = [
  { path: "icons/c.svg",           src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  { path: "icons/3d-printing.svg", src: "https://api.iconify.design/mdi/printer-3d.svg?color=%2364748b" },
  { path: "icons/linux.svg",       src: "https://api.iconify.design/logos/linux-tux.svg" },
  { path: "icons/css.svg",         src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { path: "icons/astro.svg",       src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/astro/astro-original.svg" },
  { path: "icons/groq.svg",        src: "https://api.iconify.design/bxl/groq-ai.svg?color=%23F55036" },
];

// Legacy capitalised PNGs at bucket root, replaced long ago by icons/*.svg.
// Logo.png is intentionally excluded (navbar still reads it).
const STALE_PNGS = [
  "Arduino.png", "C.png", "Css.png", "Docker.png", "Figma.png",
  "GitHub-dark.png", "GitHub.png", "Git.png", "Html.png", "Illustrator.png",
  "JavaScript.png", "Mysql.png", "Nextjs-dark.png", "Nextjs.png", "Node.png",
  "Npm.png", "Php.png", "Python.png", "React.png", "Sass.png",
  "Supabase.png", "Tailwind.png", "TypeScript.png", "Vercel-dark.png", "Vercel.png",
];

async function fetchSvg(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 icon-fix" } });
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

console.log("Deleting stale root PNGs:");
const { data: removed, error: rmErr } = await supabase.storage
  .from(BUCKET)
  .remove(STALE_PNGS);
if (rmErr) {
  failed += 1;
  console.warn(`  fail  remove: ${rmErr.message}`);
} else {
  console.log(`  ok    removed ${removed?.length ?? 0} files`);
}

console.log(failed ? `Done with ${failed} failure(s).` : "Done.");
process.exit(failed ? 1 : 0);

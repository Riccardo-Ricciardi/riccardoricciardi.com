#!/usr/bin/env node
// One-shot: set the C skill icon to the official C logo (blue hexagon) from
// Wikimedia Commons (File:C_Logo.png), and drop the old c.svg.
// Run: node scripts/set-c-icon.mjs

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
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

const SRC = "https://upload.wikimedia.org/wikipedia/commons/1/19/C_Logo.png";
const res = await fetch(SRC, { headers: { "User-Agent": "Mozilla/5.0 icon-set" } });
if (!res.ok) throw new Error(`HTTP ${res.status} on ${SRC}`);
const buf = Buffer.from(await res.arrayBuffer());

const up = await supabase.storage.from("image").upload("icons/c.png", buf, {
  contentType: "image/png",
  upsert: true,
  cacheControl: "31536000",
});
if (up.error) throw new Error(`upload c.png: ${up.error.message}`);
console.log(`ok    icons/c.png (${buf.length} B)`);

const rm = await supabase.storage.from("image").remove(["icons/c.svg"]);
if (rm.error) console.warn(`warn  remove c.svg: ${rm.error.message}`);
else console.log(`ok    removed icons/c.svg`);
console.log("Done.");

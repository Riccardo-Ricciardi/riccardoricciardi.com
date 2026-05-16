import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  pushed_at: string;
}

interface ProjectRow {
  id: string;
  repo: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function parseGitHubRepo(value: unknown): GitHubRepo | null {
  if (!isRecord(value)) return null;
  const name = asString(value.name);
  const htmlUrl = asString(value.html_url);
  const pushedAt = asString(value.pushed_at);
  if (!name || !htmlUrl || !pushedAt) return null;
  return {
    name,
    description: asString(value.description),
    html_url: htmlUrl,
    homepage: asString(value.homepage),
    stargazers_count: asNumber(value.stargazers_count),
    forks_count: asNumber(value.forks_count),
    language: asString(value.language),
    topics: asStringArray(value.topics),
    pushed_at: pushedAt,
  };
}

function parseProjectRow(value: unknown): ProjectRow | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const repo = asString(value.repo);
  if (!id || !repo) return null;
  return { id, repo };
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value || value.trim() === "") {
    throw new Error(`Required environment variable missing: ${name}`);
  }
  return value;
}

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") ?? "";

// owner/repo segments: alphanumerics, dashes, underscores, dots only.
const REPO_RE = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/;

function isValidRepo(repo: string): boolean {
  if (!REPO_RE.test(repo)) return false;
  // Defense in depth against path traversal / API path injection.
  if (repo.includes("..") || repo.includes("//")) return false;
  return true;
}

function safeEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ab.length !== bb.length) return false;
  let mismatch = 0;
  for (let i = 0; i < ab.length; i++) mismatch |= ab[i] ^ bb[i];
  return mismatch === 0;
}

async function fetchRepo(repo: string): Promise<GitHubRepo | null> {
  if (!isValidRepo(repo)) {
    console.error(`github reject invalid repo identifier`);
    return null;
  }
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "riccardoricciardi-sync",
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

  const res = await fetch(`https://api.github.com/repos/${encodeURI(repo)}`, { headers });
  if (!res.ok) {
    console.error(`github ${repo}: ${res.status} ${res.statusText}`);
    return null;
  }
  const raw: unknown = await res.json();
  const parsed = parseGitHubRepo(raw);
  if (!parsed) {
    console.error(`github ${repo}: unexpected response shape`);
    return null;
  }
  return parsed;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  if (!cronSecret || !auth.startsWith("Bearer ") || !safeEqual(auth.slice(7), cronSecret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: rows, error } = await supabase
    .from("projects")
    .select("id, repo");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const results: Array<{ repo: string; ok: boolean; error?: string }> = [];

  for (const raw of rows ?? []) {
    const row = parseProjectRow(raw);
    if (!row) {
      results.push({ repo: "unknown", ok: false, error: "invalid_row" });
      continue;
    }

    const meta = await fetchRepo(row.repo);
    if (!meta) {
      results.push({ repo: row.repo, ok: false, error: "fetch_failed" });
      continue;
    }

    const ogImage = `https://opengraph.githubassets.com/1/${row.repo}`;

    const { error: updErr } = await supabase
      .from("projects")
      .update({
        name: meta.name,
        description: meta.description,
        url: meta.html_url,
        homepage: meta.homepage,
        stars: meta.stargazers_count,
        forks: meta.forks_count,
        language: meta.language,
        topics: meta.topics ?? [],
        og_image: ogImage,
        pushed_at: meta.pushed_at,
        synced_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updErr) {
      results.push({ repo: row.repo, ok: false, error: updErr.message });
    } else {
      results.push({ repo: row.repo, ok: true });
    }
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { "content-type": "application/json" },
  });
});

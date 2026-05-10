// deno-lint-ignore-file no-explicit-any
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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") ?? "";

async function fetchRepo(repo: string): Promise<GitHubRepo | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "riccardoricciardi-sync",
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!res.ok) {
    console.error(`github ${repo}: ${res.status} ${res.statusText}`);
    return null;
  }
  return (await res.json()) as GitHubRepo;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${Deno.env.get("CRON_SECRET") ?? ""}`;
  if (!Deno.env.get("CRON_SECRET") || auth !== expected) {
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

  for (const row of rows ?? []) {
    const meta = await fetchRepo(row.repo as string);
    if (!meta) {
      results.push({ repo: row.repo as string, ok: false, error: "fetch_failed" });
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
      .eq("id", row.id as string);

    if (updErr) {
      results.push({ repo: row.repo as string, ok: false, error: updErr.message });
    } else {
      results.push({ repo: row.repo as string, ok: true });
    }
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { "content-type": "application/json" },
  });
});

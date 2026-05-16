import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { logger } from "@/utils/logger";
import {
  getCronSecretOptional,
  getSupabaseUrlOptional,
} from "@/utils/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = getCronSecretOptional();

  if (!cronSecret) {
    logger.error("cron/sync-github: CRON_SECRET not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  if (!authHeader.startsWith("Bearer ") || !safeEqual(authHeader.slice(7), cronSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseUrl = getSupabaseUrlOptional();
  if (!supabaseUrl) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });
  }

  const fnUrl = `${supabaseUrl}/functions/v1/sync-github`;

  try {
    const res = await fetch(fnUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "content-type": "application/json",
      },
    });

    const body = await res.text();
    if (!res.ok) {
      logger.error("cron/sync-github: edge function failed", {
        status: res.status,
        body: body.slice(0, 500),
      });
      return NextResponse.json(
        { error: "edge_function_failed", status: res.status },
        { status: 502 }
      );
    }

    return new NextResponse(body, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    logger.error("cron/sync-github: fetch threw", { message });
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}

"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { logger } from "@/utils/logger";

export type ContactFormState =
  | { ok: true; messageId: number }
  | { error: string }
  | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(200)
    .regex(EMAIL_RE, "invalid_email"),
  message: z.string().trim().min(5).max(2000),
  locale: z.string().max(5).default("en"),
});

type ContactFieldKey = "name" | "email" | "message";

function fieldErrorKey(issue: z.ZodIssue): string {
  const field = issue.path[0] as ContactFieldKey | undefined;
  if (field === "name") return "name_too_short";
  if (field === "email") return "invalid_email";
  if (field === "message") {
    return issue.code === "too_big" ? "message_too_long" : "message_too_short";
  }
  return "fields_required";
}

function localizedError(locale: string, key: string): string {
  const map: Record<string, Record<string, string>> = {
    en: {
      fields_required: "All fields are required.",
      name_too_short: "Please enter your name.",
      invalid_email: "Please enter a valid email.",
      message_too_short: "Message is too short.",
      message_too_long: "Message is too long (max 2000 characters).",
      rate_limited: "Too many messages. Try again later.",
      server_error: "Something went wrong. Please try again.",
    },
    it: {
      fields_required: "Compila tutti i campi.",
      name_too_short: "Inserisci il tuo nome.",
      invalid_email: "Email non valida.",
      message_too_short: "Messaggio troppo breve.",
      message_too_long: "Messaggio troppo lungo (max 2000 caratteri).",
      rate_limited: "Troppi messaggi. Riprova più tardi.",
      server_error: "Qualcosa è andato storto. Riprova.",
    },
  };
  return map[locale]?.[key] ?? map.en[key] ?? key;
}

function clientIpHash(ipHeader: string | null): string | null {
  if (!ipHeader) return null;
  const ip = ipHeader.split(",")[0]?.trim() ?? "";
  if (!ip) return null;
  return createHash("sha256")
    .update(`${ip}:${process.env.CONTACT_IP_SALT ?? "rrc"}`)
    .digest("hex")
    .slice(0, 32);
}

export async function submitContactMessageAction(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { ok: true, messageId: 0 };
  }

  const rawLocale = String(formData.get("locale") ?? "en").slice(0, 5);
  const t = (k: string) => localizedError(rawLocale, k);

  const parsed = contactSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    message: formData.get("message") ?? "",
    locale: rawLocale,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (!issue) return { error: t("fields_required") };
    return { error: t(fieldErrorKey(issue)) };
  }
  const { name, email, message, locale } = parsed.data;

  let ipHash: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = await headers();
    ipHash = clientIpHash(h.get("x-forwarded-for") ?? h.get("x-real-ip"));
    userAgent = (h.get("user-agent") ?? "").slice(0, 300) || null;
  } catch {}

  if (ipHash) {
    try {
      const supabase = createAdminClient();
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", since);
      if ((count ?? 0) >= 5) {
        return { error: t("rate_limited") };
      }
    } catch (err) {
      logger.warn("contact: rate-limit lookup failed", {
        message: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  let insertedId: number;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
        locale,
        ip_hash: ipHash,
        user_agent: userAgent,
      })
      .select("id")
      .single();
    if (error || !data) {
      logger.error("contact: insert failed", {
        message: error?.message ?? "no data",
      });
      return { error: t("server_error") };
    }
    insertedId = (data as { id: number }).id;
  } catch (err) {
    logger.error("contact: server error", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return { error: t("server_error") };
  }

  await sendNotificationEmail({ name, email, message, locale }).catch((err) => {
    logger.warn("contact: notification email failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
  });

  return { ok: true, messageId: insertedId };
}

async function sendNotificationEmail(params: {
  name: string;
  email: string;
  message: string;
  locale: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to =
    process.env.RESEND_TO ??
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ??
    null;

  if (!apiKey || !from || !to) return;

  const subject = `New contact from ${params.name} (${params.locale})`;
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <p style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">riccardoricciardi.com / contact</p>
      <h1 style="font-size:20px;font-weight:600;letter-spacing:-0.01em;margin:0 0 16px;">New message from ${escape(params.name)}</h1>
      <p style="margin:0 0 4px;color:#6b7280;font-size:12px;">Reply to:</p>
      <p style="margin:0 0 20px;"><a href="mailto:${escape(params.email)}">${escape(params.email)}</a></p>
      <div style="border-top:1px dashed #d1d5db;padding-top:16px;white-space:pre-wrap;line-height:1.6;">${escape(params.message)}</div>
      <p style="margin:24px 0 0;font-size:11px;color:#9ca3af;">Locale: ${params.locale}</p>
    </div>
  `.trim();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      reply_to: params.email,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${text.slice(0, 200)}`);
  }
}

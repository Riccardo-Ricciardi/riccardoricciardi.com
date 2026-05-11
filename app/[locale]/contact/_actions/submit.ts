"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/utils/supabase/admin";
import { logger } from "@/utils/logger";

export type ContactFormState =
  | { ok: true; messageId: number }
  | { error: string }
  | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const locale = String(formData.get("locale") ?? "en").slice(0, 5);
  const t = (k: string) => localizedError(locale, k);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) return { error: t("fields_required") };
  if (name.length < 2 || name.length > 100) return { error: t("name_too_short") };
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { error: t("invalid_email") };
  }
  if (message.length < 5) return { error: t("message_too_short") };
  if (message.length > 2000) return { error: t("message_too_long") };

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
    return { ok: true, messageId: (data as { id: number }).id };
  } catch (err) {
    logger.error("contact: server error", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return { error: t("server_error") };
  }
}

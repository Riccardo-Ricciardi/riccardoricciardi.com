/**
 * Centralized typed env accessors. Each accessor validates presence
 * and returns a narrowed type. Throw fast and clearly when a required
 * value is missing rather than producing `undefined` downstream.
 *
 * Optional accessors return `null` when absent so consumers must handle
 * the missing case explicitly.
 */

function getRequired(name: string): string {
  const raw = process.env[name];
  if (!raw || raw.trim() === "") {
    throw new Error(`Required environment variable missing: ${name}`);
  }
  return raw;
}

function getOptional(name: string): string | null {
  const raw = process.env[name];
  if (!raw || raw.trim() === "") return null;
  return raw;
}

export function getSupabaseUrl(): string {
  return getRequired("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return getRequired("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey(): string {
  return getRequired("SUPABASE_SERVICE_ROLE_KEY");
}

export function getCronSecret(): string {
  return getRequired("CRON_SECRET");
}

export function getCronSecretOptional(): string | null {
  return getOptional("CRON_SECRET");
}

export function getSiteUrl(): string {
  return (
    getOptional("NEXT_PUBLIC_SITE_URL") ?? "https://riccardoricciardi.com"
  );
}

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "info@riccardoricciardi.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getResendConfig(): {
  apiKey: string | null;
  from: string | null;
  to: string | null;
} {
  return {
    apiKey: getOptional("RESEND_API_KEY"),
    from: getOptional("RESEND_FROM"),
    to:
      getOptional("RESEND_TO") ??
      process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ??
      null,
  };
}

export function getCalApiKey(): string | null {
  return getOptional("CAL_API_KEY");
}

export function getCalUsername(): string {
  return getOptional("NEXT_PUBLIC_CAL_USERNAME") ?? "";
}

export function getCalEventSlug(): string {
  return getOptional("NEXT_PUBLIC_CAL_EVENT_SLUG") ?? "30min";
}

export function getContactIpSalt(): string {
  return getOptional("CONTACT_IP_SALT") ?? "rrc";
}

export function getSupabaseImageUrl(): string {
  return getOptional("NEXT_PUBLIC_SUPABASE_IMAGE_URL") ?? "";
}

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

function literalRequired(raw: string | undefined, name: string): string {
  if (!raw || raw.trim() === "") {
    throw new Error(`Required environment variable missing: ${name}`);
  }
  return raw;
}

export function getSupabaseUrl(): string {
  return literalRequired(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  );
}

export function getSupabaseAnonKey(): string {
  return literalRequired(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
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
    literalOptional(process.env.NEXT_PUBLIC_SITE_URL) ??
    "https://riccardoricciardi.com"
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
    to: getOptional("RESEND_TO") ?? getAdminEmails()[0] ?? null,
  };
}

export function getCalApiKey(): string | null {
  return getOptional("CAL_API_KEY");
}

export function getCalUsername(): string {
  return literalOptional(process.env.NEXT_PUBLIC_CAL_USERNAME) ?? "";
}

export function getCalEventSlug(): string {
  return literalOptional(process.env.NEXT_PUBLIC_CAL_EVENT_SLUG) ?? "30min";
}

export function getContactIpSalt(): string {
  const value = getOptional("CONTACT_IP_SALT");
  if (value && value.length >= 16) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CONTACT_IP_SALT is required in production and must be at least 16 characters"
    );
  }

  return value ?? "dev-only-insecure-salt-do-not-use-in-prod";
}

/**
 * NEXT_PUBLIC_* accessors use literal `process.env.X` reads (not dynamic
 * indexing) so Next inlines them at build time for both server and client.
 */
function literalOptional(raw: string | undefined): string | null {
  if (!raw || raw.trim() === "") return null;
  return raw;
}

export function getSupabaseImageUrl(): string {
  return literalOptional(process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL) ?? "";
}

export function getSupabaseImageUrlOptional(): string | null {
  return literalOptional(process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL);
}

export function getSupabaseUrlOptional(): string | null {
  return literalOptional(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKeyOptional(): string | null {
  return literalOptional(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSiteUrlOptional(): string | null {
  return literalOptional(process.env.NEXT_PUBLIC_SITE_URL);
}

export function getResendApiKey(): string | null {
  return getOptional("RESEND_API_KEY");
}

export function getResendFrom(): string | null {
  return getOptional("RESEND_FROM");
}

export function getResendTo(): string | null {
  return getOptional("RESEND_TO") ?? getAdminEmails()[0] ?? null;
}

export function getLanguagesEnv(): string {
  return literalOptional(process.env.NEXT_PUBLIC_LANGUAGES) ?? "en,it";
}

export function getDefaultLanguageEnv(): string | null {
  return literalOptional(process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE);
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

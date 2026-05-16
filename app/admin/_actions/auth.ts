"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ADMIN_EMAILS } from "@/utils/auth/admin";
import { logger } from "@/utils/logger";

const GENERIC_LOGIN_ERROR = "invalid_credentials";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=missing_fields");
  }

  // Always go through Supabase auth (even for non-allowlisted emails) so the
  // response timing/wording does not reveal which addresses are admins.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !ADMIN_EMAILS.includes(email)) {
    // If credentials are valid but not allowlisted, sign back out.
    if (!error && !ADMIN_EMAILS.includes(email)) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        logger.warn("loginAction: signOut after non-admin login failed", {
          message: e instanceof Error ? e.message : "unknown",
        });
      }
    }
    redirect(`/admin/login?error=${GENERIC_LOGIN_ERROR}`);
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

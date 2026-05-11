"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ADMIN_EMAILS } from "@/utils/auth/admin";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=missing_fields");
  }
  if (!ADMIN_EMAILS.includes(email)) {
    redirect("/admin/login?error=not_authorized");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

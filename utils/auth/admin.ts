import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

export const ADMIN_EMAILS: string[] = (
  process.env.ADMIN_EMAILS ?? "info@riccardoricciardi.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  const email = (data.user.email ?? "").toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) return null;
  return data.user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

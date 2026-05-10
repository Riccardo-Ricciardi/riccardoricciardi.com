import Link from "next/link";
import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const CARDS = [
  { href: "/admin/skills", title: "Skills", desc: "Tech stack with proficiency" },
  { href: "/admin/projects", title: "Projects", desc: "GitHub repos + i18n" },
  { href: "/admin/navbar", title: "Navbar", desc: "Menu items per language" },
  { href: "/admin/languages", title: "Languages", desc: "Add or remove locales" },
];

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = await createClient();

  const [skills, projects, navbar, languages] = await Promise.all([
    supabase.from("skills").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("navbar").select("*", { count: "exact", head: true }),
    supabase.from("languages").select("*", { count: "exact", head: true }),
  ]);

  const counts: Record<string, number | null> = {
    "/admin/skills": skills.count,
    "/admin/projects": projects.count,
    "/admin/navbar": navbar.count,
    "/admin/languages": languages.count,
  };

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
      </header>
      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
        {CARDS.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="block rounded-xl border border-dashed border-dashed-soft bg-card p-6 transition-colors hover:border-accent-blue hover:shadow-[0_0_0_1px_var(--accent-blue-soft)]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-medium tracking-tight">
                  {card.title}
                </h2>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {counts[card.href] ?? "—"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

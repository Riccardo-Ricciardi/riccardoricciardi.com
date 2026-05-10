import type { Metadata } from "next";
import { getAdminUser } from "@/utils/auth/admin";
import { logoutAction } from "@/app/admin/actions";
import { createAdminClient } from "@/utils/supabase/admin";
import { AdminNav, type NavGroup } from "@/components/admin/admin-nav";
import { Toaster } from "@/components/ui/sonner";
import { AdminToastListener } from "@/components/admin/toast-listener";
import { CommandPalette } from "@/components/admin/command-palette";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Translations",
    items: [
      { href: "/admin/content", label: "Content" },
      { href: "/admin/navbar", label: "Navbar" },
      { href: "/admin/not-found", label: "404 strings" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/skills", label: "Skills" },
      { href: "/admin/projects", label: "Projects" },
    ],
  },
  {
    label: "Design",
    items: [{ href: "/admin/theme", label: "Theme" }],
  },
  {
    label: "System",
    items: [{ href: "/admin/languages", label: "Languages" }],
  },
];

function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded border border-dashed border-dashed-soft px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors hover:border-accent-blue hover:text-accent-blue"
      >
        Logout
      </button>
    </form>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  if (!user) {
    return <div className="min-h-screen">{children}</div>;
  }

  const supabase = createAdminClient();
  const [skillsRes, projectsRes, navbarRes, contentRes, languagesRes] =
    await Promise.all([
      supabase.from("skills").select("id, name").order("name"),
      supabase.from("projects").select("id, repo, name").order("repo"),
      supabase.from("navbar").select("slug, value, language_id"),
      supabase.from("content_blocks").select("slug"),
      supabase.from("languages").select("code, name").order("id"),
    ]);

  const skills = (skillsRes.data ?? []) as Array<{
    id: number;
    name: string;
  }>;
  const projects = (projectsRes.data ?? []) as Array<{
    id: string;
    repo: string;
    name: string | null;
  }>;
  const allNavRows = (navbarRes.data ?? []) as Array<{
    slug: string | null;
    value: string;
    language_id: number;
  }>;
  const contentRows = (contentRes.data ?? []) as Array<{ slug: string }>;
  const languages = (languagesRes.data ?? []) as Array<{
    code: string;
    name: string;
  }>;

  const navbarBySlug = new Map<string, string>();
  for (const r of allNavRows) {
    const slug = r.slug ?? "";
    if (!navbarBySlug.has(slug)) navbarBySlug.set(slug, r.value);
  }
  const navbarSlugs = Array.from(navbarBySlug.entries()).map(
    ([slug, value]) => ({ slug, value })
  );

  const contentSlugs = Array.from(
    new Set(contentRows.map((r) => r.slug))
  ).map((slug) => ({ slug }));

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav
        groups={NAV_GROUPS}
        email={user.email ?? null}
        logoutSlot={<LogoutButton />}
      />
      <main className="flex-1">
        <div className="container-page py-8">{children}</div>
      </main>
      <Toaster position="bottom-right" richColors />
      <AdminToastListener />
      <CommandPalette
        skills={skills}
        projects={projects}
        navbarSlugs={navbarSlugs}
        contentSlugs={contentSlugs}
        languages={languages}
      />
    </div>
  );
}

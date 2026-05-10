import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUser } from "@/utils/auth/admin";
import { logoutAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/theme", label: "Theme" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/navbar", label: "Navbar" },
  { href: "/admin/languages", label: "Languages" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  if (!user) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="section-divider-b sticky top-0 z-30 bg-background/90 backdrop-blur">
        <div className="container-page flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-mono text-sm font-medium tracking-tight"
            >
              admin
            </Link>
            <nav>
              <ul className="flex items-center gap-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-accent-blue"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{user.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded border border-dashed border-dashed-soft px-2 py-1 text-xs transition-colors hover:border-accent-blue hover:text-accent-blue"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container-page py-8">{children}</div>
      </main>
    </div>
  );
}

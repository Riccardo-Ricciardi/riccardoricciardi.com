import type { Metadata } from "next";
import { getAdminUser } from "@/utils/auth/admin";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav, type NavGroup } from "@/components/admin/admin-nav";
import { Toaster } from "@/components/ui/sonner";
import { AdminToastListener } from "@/components/admin/toast-listener";

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
    </div>
  );
}

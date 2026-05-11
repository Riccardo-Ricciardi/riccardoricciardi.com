import type { Metadata } from "next";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { getAdminUser } from "@/utils/auth/admin";
import { APP_CONFIG } from "@/utils/config/app";
import { logoutAction } from "@/app/admin/_actions/auth";
import { Sidebar } from "@/components/admin/shell/sidebar";
import { BottomNav } from "@/components/admin/shell/bottom-nav";
import { Topbar } from "@/components/admin/shell/topbar";
import { Toaster } from "@/components/ui/sonner";
import { AdminToastListener } from "@/components/admin/actions/toast-listener";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logoutAction} className="w-full">
      <button
        type="submit"
        className={
          compact
            ? "admin-button admin-button-ghost h-8 w-8 px-0"
            : "admin-button admin-button-ghost w-full text-xs"
        }
        aria-label="Sign out"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        {!compact && <span>Sign out</span>}
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

  const email = user.email ?? null;
  const liveSiteUrl = APP_CONFIG.siteUrl;

  return (
    <div className="min-h-screen">
      <Sidebar
        liveSiteUrl={liveSiteUrl}
        email={email}
        logoutSlot={<LogoutButton />}
      />
      <Topbar />
      <main className="min-h-screen pl-0 transition-[padding] duration-200 md:[padding-left:var(--admin-sidebar-w,15rem)]">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pt-8 md:pb-12 md:pl-10 md:pr-8">
          {children}
        </div>
      </main>
      <BottomNav
        liveSiteUrl={liveSiteUrl}
        email={email}
        logoutSlot={<LogoutButton />}
      />
      <Toaster position="top-right" richColors closeButton />
      <Suspense fallback={null}>
        <AdminToastListener />
      </Suspense>
    </div>
  );
}

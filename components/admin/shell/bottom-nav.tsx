"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { MOBILE_TABS, ADMIN_NAV } from "@/components/admin/nav-config";
import { cn } from "@/utils/cn";

interface BottomNavProps {
  liveSiteUrl: string;
  email: string | null;
  logoutSlot: React.ReactNode;
}

export function BottomNav({ liveSiteUrl, email, logoutSlot }: BottomNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = !MOBILE_TABS.some((t) =>
    t.href === "/admin"
      ? pathname === "/admin"
      : pathname === t.href || pathname.startsWith(`${t.href}/`)
  );

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t admin-divider bg-background/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid list-none grid-cols-5 p-0">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active =
              tab.href === "/admin"
                ? pathname === "/admin"
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] uppercase tracking-wider transition-colors",
                    active
                      ? "text-accent-blue"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{tab.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={cn(
                "flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[10px] uppercase tracking-wider transition-colors",
                isMoreActive
                  ? "text-accent-blue"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="More admin sections"
          className="fixed inset-0 z-40 flex flex-col bg-background/95 backdrop-blur md:hidden"
        >
          <header className="flex items-center justify-between border-b admin-divider px-4 py-3">
            <div>
              <p className="admin-eyebrow">Menu</p>
              <p className="mt-0.5 truncate text-sm">{email ?? "Anonymous"}</p>
            </div>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label="Close menu"
              className="admin-button admin-button-ghost h-10 w-10 px-0"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-3 py-4 pb-24">
            {ADMIN_NAV.map((group) => (
              <section key={group.label} className="mb-5">
                <p className="px-2 pb-2 admin-eyebrow">{group.label}</p>
                <ul className="list-none space-y-0.5 p-0">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm transition-colors admin-tap-44",
                            active
                              ? "bg-accent text-foreground"
                              : "text-foreground hover:bg-accent/60"
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            <section className="mb-5">
              <p className="px-2 pb-2 admin-eyebrow">Account</p>
              <a
                href={liveSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm text-foreground transition-colors hover:bg-accent/60 admin-tap-44"
              >
                <span>View live site</span>
              </a>
              <div className="px-3 pt-2">{logoutSlot}</div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

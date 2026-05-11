"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { ADMIN_NAV } from "@/components/admin/nav-config";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "admin:sidebar:collapsed";

interface SidebarProps {
  liveSiteUrl: string;
  email: string | null;
  logoutSlot: React.ReactNode;
}

export function Sidebar({ liveSiteUrl, email, logoutSlot }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--admin-sidebar-w",
        collapsed ? "4rem" : "15rem"
      );
    }
  }, [collapsed]);

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r admin-divider bg-card/40 backdrop-blur-sm transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b admin-divider px-3 py-3.5">
        <Link
          href="/admin"
          aria-label="Admin dashboard"
          className="flex items-center gap-2.5 truncate text-sm font-semibold tracking-tight focus-visible:outline-none"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent-blue text-[11px] font-bold text-white">
            R.
          </span>
          {!collapsed && <span className="truncate">Riccardo · Admin</span>}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 admin-scrollbar-hide">
        <ul className="flex list-none flex-col gap-5 p-0">
          {ADMIN_NAV.map((group) => (
            <li key={group.label}>
              {!collapsed && (
                <p className="px-2.5 pb-1.5 admin-eyebrow">{group.label}</p>
              )}
              <ul className="flex list-none flex-col gap-0.5 p-0">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                          active
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                          collapsed && "justify-center"
                        )}
                      >
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent-blue"
                          />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-foreground" : "text-muted-foreground"
                          )}
                          aria-hidden="true"
                        />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t admin-divider px-2 py-3">
        <a
          href={liveSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open live site"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
            collapsed && "justify-center"
          )}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {!collapsed && <span className="truncate">View live site</span>}
        </a>
        {!collapsed && (
          <div className="mt-2 rounded-md border admin-divider bg-background/40 px-2.5 py-2">
            <p className="truncate text-[11px] text-muted-foreground">
              {email ?? "Anonymous"}
            </p>
            <div className="mt-1.5">{logoutSlot}</div>
          </div>
        )}
        {collapsed && <div className="mt-2 grid place-items-center">{logoutSlot}</div>}
      </div>
    </aside>
  );
}

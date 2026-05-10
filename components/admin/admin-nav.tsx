"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export interface NavGroup {
  label: string;
  items: { href: string; label: string }[];
}

interface AdminNavProps {
  groups: NavGroup[];
  email: string | null;
  logoutSlot: React.ReactNode;
}

export function AdminNav({ groups, email, logoutSlot }: AdminNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <header className="section-divider-b sticky top-0 z-40 bg-background/90 backdrop-blur">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <Link
            href="/admin"
            className="font-mono text-sm font-medium tracking-tight"
          >
            admin
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {groups.map((group) => (
              <div key={group.label} className="flex items-center gap-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </span>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded px-2 py-1 text-sm transition-colors ${
                      isActive(item.href)
                        ? "text-accent-blue"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-xs text-muted-foreground">
              {email}
            </span>
            <div className="hidden md:block">{logoutSlot}</div>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden rounded border border-dashed border-dashed-soft p-1.5 transition-colors hover:border-accent-blue"
            >
              {open ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-background/95 backdrop-blur">
          <nav className="container-page flex flex-col gap-6 py-6 overflow-y-auto h-[calc(100vh-3.5rem)]">
            {groups.map((group) => (
              <section key={group.label}>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </p>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded-md px-3 py-2 text-base transition-colors ${
                          isActive(item.href)
                            ? "bg-accent/40 text-accent-blue"
                            : "hover:bg-accent/40"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="mt-2 flex items-center justify-between border-t border-dashed border-dashed-soft pt-4">
              {email && (
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              )}
              {logoutSlot}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

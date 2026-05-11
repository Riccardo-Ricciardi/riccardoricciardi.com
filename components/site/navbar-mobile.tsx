"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavbarItem } from "@/utils/i18n/types";

interface NavbarMobileProps {
  items: NavbarItem[];
  locale: string;
  ariaLabel: string;
}

export function NavbarMobile({ items, locale, ariaLabel }: NavbarMobileProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="grid h-9 w-9 place-items-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-dashed border-dashed-soft px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Menu
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col px-4 py-6">
            <ul className="flex list-none flex-col gap-1 p-0">
              {items.map(({ slug, label }, i) => (
                <li key={slug || "home"}>
                  <Link
                    href={slug ? `/${locale}/${slug}` : `/${locale}`}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline justify-between rounded-md px-3 py-4 text-2xl font-semibold tracking-tight transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>{label}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

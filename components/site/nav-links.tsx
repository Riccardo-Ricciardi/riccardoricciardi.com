"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavbarItem } from "@/utils/i18n/types";

interface NavLinksProps {
  items: NavbarItem[];
  locale: string;
}

function hrefFor(locale: string, slug: string): string {
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

function isActive(pathname: string, locale: string, slug: string): boolean {
  const target = hrefFor(locale, slug);
  if (!slug) {
    return pathname === `/${locale}` || pathname === `/${locale}/`;
  }
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function NavLinks({ items, locale }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-0.5">
      {items.map(({ slug, label }) => {
        const active = isActive(pathname, locale, slug);
        return (
          <li key={slug || "home"}>
            <Link
              href={hrefFor(locale, slug)}
              aria-current={active ? "page" : undefined}
              className={
                "relative inline-block whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:text-accent-blue " +
                (active ? "text-accent-blue" : "text-foreground/80")
              }
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

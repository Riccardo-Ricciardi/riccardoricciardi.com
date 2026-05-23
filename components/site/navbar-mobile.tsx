"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavbarItem } from "@/utils/i18n/types";

function isActive(pathname: string, locale: string, slug: string): boolean {
  if (!slug) {
    return pathname === `/${locale}` || pathname === `/${locale}/`;
  }
  const target = `/${locale}/${slug}`;
  return pathname === target || pathname.startsWith(`${target}/`);
}

interface NavbarMobileProps {
  items: NavbarItem[];
  locale: string;
  ariaLabel: string;
}

export function NavbarMobile({ items, locale, ariaLabel }: NavbarMobileProps) {
  const pathname = usePathname();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={ariaLabel}
          className="text-foreground/80 transition-colors hover:bg-transparent hover:text-accent-blue"
        >
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {items.map(({ slug, label }) => {
          const href = slug ? `/${locale}/${slug}` : `/${locale}`;
          const active = isActive(pathname, locale, slug);
          return (
            <DropdownMenuItem
              key={slug || "home"}
              asChild
              aria-current={active ? "page" : undefined}
              className={active ? "font-bold" : undefined}
            >
              <Link href={href}>{label}</Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

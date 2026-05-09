"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavbarItem } from "@/utils/i18n/types";

interface NavbarMobileProps {
  items: NavbarItem[];
  locale: string;
  ariaLabel: string;
}

export function NavbarMobile({ items, locale, ariaLabel }: NavbarMobileProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={ariaLabel}>
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map(({ slug, label }) => (
          <DropdownMenuItem key={slug || "home"} asChild>
            <Link
              href={slug ? `/${locale}/${slug}` : `/${locale}`}
              className="w-full"
            >
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

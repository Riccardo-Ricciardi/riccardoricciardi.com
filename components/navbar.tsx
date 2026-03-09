"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { LanguagePicker } from "@/components/languageManager";
import { ThemePicker } from "@/components/themeManager";
import { useTranslationStore } from "@/utils/useTranslations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useIsMobile } from "@/utils/useIsMobile";
import { useEnsureTranslations } from "@/utils/hooks/useEnsureTranslations";

interface NavbarProps {
  language: string;
  table: string;
}

const LOGO_URL =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL?.concat("/Logo.png") ??
  "/logo.png";

export default function Navbar({ language, table }: NavbarProps) {
  const isMobile = useIsMobile();
  useEnsureTranslations();

  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/85">
      <div
        className="mx-auto h-14 flex justify-between items-center"
        style={{ width: "clamp(0px, 80%, 1200px)" }}
      >
        <div className="block w-[36px] h-[36px] shrink-0">
          <Link href="/">
            <Image
              src={LOGO_URL}
              alt="Logo"
              width={36}
              height={36}
              priority
              className="w-[36px] h-[36px] object-contain"
            />
          </Link>
        </div>

        {isMobile ? (
          <div className="flex items-center space-x-2">
            <ThemePicker />
            <LanguagePicker />
            <NavbarMobile language={language} table={table} />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <NavbarDesktop language={language} table={table} />
            <ThemePicker />
            <LanguagePicker />
          </div>
        )}
      </div>
    </header>
  );
}

function NavbarDesktop({
  language,
  table,
}: {
  language: string;
  table: string;
}) {
  const { translations } = useTranslationStore();
  const translation = translations?.[language]?.[table] ?? [];

  return (
    <ul className="flex items-center space-x-2 pl-28 text-card-foreground">
      {translation.map((text, index) => (
        <li key={text}>
          <Link
            href={index === 0 ? "/" : `/${text.toLowerCase()}`}
            className="whitespace-nowrap"
          >
            {text}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NavbarMobile({
  language,
  table,
}: {
  language: string;
  table: string;
}) {
  const { translations } = useTranslationStore();
  const translation = translations?.[language]?.[table] ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {translation.map((text, index) => (
          <DropdownMenuItem key={text}>
            <Link
              href={index === 0 ? "/" : `/${text.toLowerCase()}`}
              className="w-full"
            >
              {text}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

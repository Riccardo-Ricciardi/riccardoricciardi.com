"use client";
import { useEffect, useState, useRef } from "react";
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
import { useLoadingManager } from "@/components/loadingManager";

interface NavbarProps {
  language: string;
  table: string;
}

export default function Navbar({ language, table }: NavbarProps) {
  const { translations, loadTranslations } = useTranslationStore();
  const { registerLoader, hideLoader } = useLoadingManager();
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerLoader();
    registerLoader();

    if (Object.keys(translations).length === 0) {
      loadTranslations().then(() => {
        if (containerRef.current && !isMobile) {
          const rect = containerRef.current.getBoundingClientRect();
          const children = Array.from(
            containerRef.current.children
          ) as HTMLElement[];
          let overflowDetected = false;
          for (const child of children) {
            if (child.getBoundingClientRect().right > rect.right) {
              setIsMobile(true);
              overflowDetected = true;
              break;
            }
          }
          if (!overflowDetected) setIsMobile(false);
        }
        hideLoader();
      });
    } else {
      hideLoader();
    }
  }, [translations, loadTranslations, hideLoader, isMobile, registerLoader]);

  useEffect(() => {
    const handleResize = () => {
      if (isMobile) return;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const children = Array.from(
          containerRef.current.children
        ) as HTMLElement[];
        for (const child of children) {
          if (child.getBoundingClientRect().right > rect.right) {
            setIsMobile(true);
            break;
          }
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  useEffect(() => {
    if (containerRef.current && !isMobile) {
      const rect = containerRef.current.getBoundingClientRect();
      const children = Array.from(
        containerRef.current.children
      ) as HTMLElement[];
      let overflowDetected = false;
      for (const child of children) {
        if (child.getBoundingClientRect().right > rect.right) {
          setIsMobile(true);
          overflowDetected = true;
          break;
        }
      }
      if (!overflowDetected) setIsMobile(false);
    }
  }, [language, isMobile]);

  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div
        className="mx-auto h-14 flex justify-between items-center"
        style={{ width: "clamp(0px, 80%, 1200px)" }}
        ref={containerRef}
      >
        <div className="block w-[36px] h-[36px] shrink-0">
          <Link href="/">
            <Image
              src="https://yfzqurdmbllthonjdzpb.supabase.co/storage/v1/object/public/image//Logo.png"
              alt="Logo"
              width={36}
              height={36}
              priority
              className="w-[36px] h-[36px] object-contain"
              onLoad={() => {
                hideLoader();
              }}
            />
          </Link>
        </div>

        <div>
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
        <li key={index}>
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
          <DropdownMenuItem key={index}>
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

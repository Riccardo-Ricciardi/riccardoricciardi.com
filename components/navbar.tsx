"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LanguagePicker } from "@/components/languagePicker";
import { ThemePicker } from "@/components/themePicker";
import { useTranslations } from "@/utils/translations";
import { getNavbarBreakpoint } from "@/utils/getBreakpoint";

interface NavbarProps {
  lang: string;
  table: string;
}

function MenuList({ menuItems }: { menuItems: string[] }) {
  return (
    <>
      {menuItems.map((text) => (
        <li key={text}>
          <Link href="#" className="whitespace-nowrap">
            {text}
          </Link>
        </li>
      ))}
    </>
  );
}

export default function Navbar({ lang, table }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { translations, loadAllTranslations } = useTranslations();

  const [breakpoint, setBreakpoint] = useState<number | null>(null);

  useEffect(() => {
    const fetchBreakpoint = async () => {
      const currentBreakpoint = await getNavbarBreakpoint(lang);
      setBreakpoint(currentBreakpoint);
    };

    fetchBreakpoint();

    if (breakpoint !== null) {
      setIsMobile(breakpoint >= window.innerWidth);
    }

    if (Object.keys(translations).length === 0) {
      loadAllTranslations().then(() => setLoading(false));
    } else {
      setLoading(false);
    }

    setMounted(true);
  }, [translations, loadAllTranslations, breakpoint, lang]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  if (!mounted) return null;

  return (
    <nav className="bg-secondary">
      <div
        className="mx-auto flex justify-between items-center py-4"
        style={{ width: "clamp(0px, 80%, 1200px)" }}
      >
        <h1 className="text-xl font-bold text-primary">Logo</h1>
        {!isMobile ? (
          <ul className="flex items-center space-x-6 pl-16 text-primary">
            {loading ? (
              <li>Caricamento...</li>
            ) : (
              <>
                <MenuList menuItems={translations[lang]?.[table] || []} />
                <li className="flex items-center space-x-3">
                  <ThemePicker />
                  <LanguagePicker isMobile={isMobile} />
                </li>
              </>
            )}
          </ul>
        ) : (
          <div className="flex items-center">
            {isMobileMenuOpen ? (
              <X className="text-primary" onClick={toggleMobileMenu} />
            ) : (
              <Menu className="text-primary" onClick={toggleMobileMenu} />
            )}
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <ul
          className="mx-auto py-4 text-primary space-y-2"
          style={{ width: "clamp(0px, 80%, 1200px)" }}
        >
          {loading ? (
            <li>Caricamento...</li>
          ) : (
            <>
              <MenuList menuItems={translations[lang]?.[table] || []} />
              <li className="flex items-center space-x-3">
                <ThemePicker />
                <LanguagePicker isMobile={isMobile} />
              </li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
}

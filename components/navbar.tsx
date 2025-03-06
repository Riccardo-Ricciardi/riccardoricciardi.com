"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LanguagePicker } from "@/components/languagePicker";
import { ThemePicker } from "@/components/themePicker";
import { useTranslations } from "@/utils/translations";

interface NavbarProps {
  lang: string;
  table: string;
}

function MenuList({
  menuItems,
}: {
  menuItems: string[];
}) {
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

  const navRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (Object.keys(translations).length === 0) {
      loadAllTranslations().then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [translations, loadAllTranslations]);

  useEffect(() => {
    const handleResize = () => {
      if (navRef.current && menuRef.current && logoRef.current) {
        const { width: navWidth } = navRef.current.getBoundingClientRect();
        const { width: menuWidth } = menuRef.current.getBoundingClientRect();
        const { width: logoWidth } = logoRef.current.getBoundingClientRect();

        if (menuWidth + logoWidth > navWidth) {
          setIsMobile(true);
        } else {
          setIsMobile(false);
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (menuRef.current && logoRef.current && navRef.current) {
      resizeObserver.observe(menuRef.current);
      resizeObserver.observe(logoRef.current);
      resizeObserver.observe(navRef.current);
    }

    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [translations]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  if (!mounted) return null;

  return (
    <nav className="bg-secondary">
      <div
        ref={navRef}
        className="mx-auto flex justify-between items-center py-4"
        style={{ width: "clamp(0px, 80%, 1200px)" }}
      >
        <h1 ref={logoRef} className="text-xl font-bold text-primary">
          Logo
        </h1>
        {!isMobile ? (
          <ul
            ref={menuRef}
            className="flex items-center space-x-6 pl-16 text-primary"
          >
            {loading ? (
              <li>Caricamento...</li>
            ) : (
              <>
                <MenuList
                  menuItems={translations[lang]?.[table] || []}
                />
                <li className="flex items-center space-x-3">
                  <ThemePicker isMobile={isMobile} />
                  <LanguagePicker isMobile={isMobile} />
                </li>
              </>
            )}
          </ul>
        ) : (
          // Menu Mobile
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
              <MenuList
                menuItems={translations[lang]?.[table] || []}
              />
              <li className="flex items-center space-x-3">
                <ThemePicker isMobile={isMobile} />
                <LanguagePicker isMobile={isMobile} />
              </li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
}

import Image from "next/image";
import Link from "next/link";
import { LanguagePicker } from "@/components/language-picker";
import { ThemePicker } from "@/components/theme-picker";
import { NavbarMobile } from "@/components/site/navbar-mobile";
import { NavLinks } from "@/components/site/nav-links";
import { ScrolledHeader } from "@/components/site/scrolled-header";
import type { Dictionary } from "@/utils/i18n/types";
import type { SupportedLanguage } from "@/utils/config/app";

const LOGO_URL =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL?.concat("/Logo.png") ??
  "/logo.png";

interface NavbarProps {
  locale: SupportedLanguage;
  dictionary: Dictionary;
  ariaLabels: {
    nav: string;
    menu: string;
    language: string;
    theme: string;
    home: string;
  };
}

const NAV_WHITELIST = ["", "about", "work", "contact"] as const;
const NAV_FALLBACK_LABELS: Record<string, { it: string; en: string }> = {
  "": { it: "Home", en: "Home" },
  about: { it: "Chi sono", en: "About me" },
  work: { it: "Lavori", en: "Work" },
  contact: { it: "Contatti", en: "Contact" },
};

function buildNavItems(
  dictionaryItems: NavbarProps["dictionary"]["navbar"],
  locale: SupportedLanguage
): NavbarProps["dictionary"]["navbar"] {
  const bySlug = new Map(dictionaryItems.map((item) => [item.slug, item]));
  return NAV_WHITELIST.map((slug, index) => {
    const existing = bySlug.get(slug);
    if (existing) return existing;
    const fallback = NAV_FALLBACK_LABELS[slug];
    return {
      slug,
      label: fallback ? fallback[locale === "it" ? "it" : "en"] : slug,
      position: index,
    };
  });
}

export function Navbar({ locale, dictionary, ariaLabels }: NavbarProps) {
  const items = buildNavItems(dictionary.navbar, locale);

  return (
    <ScrolledHeader
      ariaLabel={ariaLabels.nav}
      className="navbar-shell fixed inset-x-0 top-0 z-50 w-full"
    >
      <div className="container-page flex h-14 items-center justify-between">
        <Link
          href={`/${locale}`}
          className="block h-9 w-9 shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={ariaLabels.home}
        >
          <Image
            src={LOGO_URL}
            alt={ariaLabels.home}
            width={36}
            height={36}
            priority
            className="h-9 w-9 object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-card-foreground">
          <NavLinks items={items} locale={locale} />
          <span
            aria-hidden="true"
            className="mx-2 h-4 w-px bg-border"
          />
          <ThemePicker labels={dictionary.theme} ariaLabel={ariaLabels.theme} />
          <LanguagePicker locale={locale} ariaLabel={ariaLabels.language} />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemePicker labels={dictionary.theme} ariaLabel={ariaLabels.theme} />
          <LanguagePicker locale={locale} ariaLabel={ariaLabels.language} />
          <NavbarMobile
            items={items}
            locale={locale}
            ariaLabel={ariaLabels.menu}
          />
        </div>
      </div>
    </ScrolledHeader>
  );
}

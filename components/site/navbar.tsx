import Image from "next/image";
import Link from "next/link";
import {
  LanguagePicker,
  type LanguageOption,
} from "@/components/language-picker";
import { ThemePicker } from "@/components/theme-picker";
import { NavbarMobile } from "@/components/site/navbar-mobile";
import { NavLinks } from "@/components/site/nav-links";
import { ScrolledHeader } from "@/components/site/scrolled-header";
import type { Dictionary } from "@/utils/i18n/types";
import type { SupportedLanguage } from "@/utils/config/app";
import { getSupabaseImageUrlOptional } from "@/utils/env";

const LOGO_URL =
  getSupabaseImageUrlOptional()?.concat("/Logo.png") ?? "/logo.png";

interface NavbarProps {
  locale: SupportedLanguage;
  dictionary: Dictionary;
  languages: LanguageOption[];
  ariaLabels: {
    nav: string;
    menu: string;
    menuClose: string;
    menuTitle: string;
    language: string;
    theme: string;
    home: string;
  };
}

export function Navbar({
  locale,
  dictionary,
  languages,
  ariaLabels,
}: NavbarProps) {
  const items = [...dictionary.navbar].sort((a, b) => a.position - b.position);

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
            alt=""
            aria-hidden="true"
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
          <LanguagePicker
            locale={locale}
            ariaLabel={ariaLabels.language}
            languages={languages}
          />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemePicker labels={dictionary.theme} ariaLabel={ariaLabels.theme} />
          <LanguagePicker
            locale={locale}
            ariaLabel={ariaLabels.language}
            languages={languages}
          />
          <NavbarMobile
            items={items}
            locale={locale}
            ariaLabel={ariaLabels.menu}
            closeLabel={ariaLabels.menuClose}
            menuTitle={ariaLabels.menuTitle}
          />
        </div>
      </div>
    </ScrolledHeader>
  );
}

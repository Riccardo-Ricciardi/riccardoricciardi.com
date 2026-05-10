import Link from "next/link";
import Image from "next/image";
import { LanguagePicker } from "@/components/language-picker";
import { ThemePicker } from "@/components/theme-picker";
import { NavbarMobile } from "@/components/navbar-mobile";
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

export function Navbar({ locale, dictionary, ariaLabels }: NavbarProps) {
  const items = dictionary.navbar;

  return (
    <header
      className="border-grid sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/85"
      aria-label={ariaLabels.nav}
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

        <nav className="hidden md:flex items-center gap-2 text-card-foreground">
          <ul className="flex items-center gap-2">
            {items.map(({ slug, label }) => (
              <li key={slug || "home"}>
                <Link
                  href={slug ? `/${locale}/${slug}` : `/${locale}`}
                  className="whitespace-nowrap rounded px-2 py-1 transition-colors hover:text-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemePicker labels={dictionary.theme} ariaLabel={ariaLabels.theme} />
          <LanguagePicker locale={locale} ariaLabel={ariaLabels.language} />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemePicker labels={dictionary.theme} ariaLabel={ariaLabels.theme} />
          <LanguagePicker locale={locale} ariaLabel={ariaLabels.language} />
          <NavbarMobile
            items={items}
            locale={locale}
            ariaLabel={ariaLabels.menu}
          />
        </div>
      </div>
    </header>
  );
}

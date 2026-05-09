"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { GB, IT } from "country-flag-icons/react/3x2";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalLoader } from "@/components/global-loader";
import {
  APP_CONFIG,
  isSupportedLanguage,
  type SupportedLanguage,
} from "@/utils/config/app";

const FLAGS: Record<SupportedLanguage, { component: typeof GB; label: string }> = {
  en: { component: GB, label: "English" },
  it: { component: IT, label: "Italiano" },
};

interface LanguagePickerProps {
  locale: SupportedLanguage;
  ariaLabel: string;
}

function swapLocale(pathname: string, next: SupportedLanguage): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${next}`;
  if (isSupportedLanguage(segments[0])) {
    segments[0] = next;
  } else {
    segments.unshift(next);
  }
  return `/${segments.join("/")}`;
}

export function LanguagePicker({ locale, ariaLabel }: LanguagePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (next: SupportedLanguage) => {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.replace(swapLocale(pathname, next));
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      {isPending && <GlobalLoader fullscreen />}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={ariaLabel}
          disabled={isPending}
        >
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {APP_CONFIG.languages.map((code) => {
          const Flag = FLAGS[code].component;
          const isActive = code === locale;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleSelect(code)}
              className={`flex items-center gap-2 ${isActive ? "font-bold" : ""}`}
              aria-current={isActive ? "true" : undefined}
            >
              <Flag title={FLAGS[code].label} />
              {FLAGS[code].label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

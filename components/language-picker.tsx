"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import {
  GB,
  IT,
  FR,
  DE,
  ES,
  PT,
  US,
  CN,
  JP,
  KR,
  RU,
  NL,
  PL,
  type FlagComponent,
} from "country-flag-icons/react/3x2";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalLoader } from "@/components/global-loader";

const FLAGS: Record<string, FlagComponent> = {
  en: GB,
  "en-gb": GB,
  "en-us": US,
  it: IT,
  fr: FR,
  de: DE,
  es: ES,
  pt: PT,
  zh: CN,
  ja: JP,
  ko: KR,
  ru: RU,
  nl: NL,
  pl: PL,
};

export interface LanguageOption {
  code: string;
  name: string;
}

interface LanguagePickerProps {
  locale: string;
  ariaLabel: string;
  languages: LanguageOption[];
}

function swapLocale(
  pathname: string,
  next: string,
  knownCodes: string[]
): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${next}`;
  if (knownCodes.includes(segments[0])) {
    segments[0] = next;
  } else {
    segments.unshift(next);
  }
  return `/${segments.join("/")}`;
}

export function LanguagePicker({
  locale,
  ariaLabel,
  languages,
}: LanguagePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const codes = languages.map((l) => l.code);

  const handleSelect = (next: string) => {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.replace(swapLocale(pathname, next, codes));
      router.refresh();
    });
  };

  return (
    <DropdownMenu modal={false}>
      {isPending && <GlobalLoader fullscreen />}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={ariaLabel}
          disabled={isPending}
          className="text-foreground/80 transition-colors hover:bg-transparent hover:text-accent-blue"
        >
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(({ code, name }) => {
          const Flag = FLAGS[code.toLowerCase()];
          const isActive = code === locale;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleSelect(code)}
              className={`flex items-center gap-2 ${isActive ? "font-bold" : ""}`}
              aria-current={isActive ? "true" : undefined}
            >
              {Flag ? <Flag title={name} /> : null}
              {name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

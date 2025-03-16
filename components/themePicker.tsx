"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, ThemeProvider as NextThemesProvider } from "next-themes";
import { useTranslationStore } from "@/utils/useTranslations";
import { useLanguageStore } from "@/components/languagePicker";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemePicker() {
  const { setTheme } = useTheme();
  const { language } = useLanguageStore();
  const [isMounted, setIsMounted] = useState(false);
  const { translations, loadTranslations } = useTranslationStore();

  useEffect(() => {
    if (Object.keys(translations).length === 0) {
      loadTranslations().then(() => setIsMounted(true));
    } else {
      setIsMounted(true);
    }
  }, [translations, loadTranslations]);

  if (!isMounted) return null;

  const themeOptions = ["light", "dark", "system"];
  const themeItems =
    translations?.[language]?.["theme"] ??
    themeOptions.map(capitalizeFirstLetter);

  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  console.log(themeItems)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeItems.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => setTheme(themeOptions[index].toLowerCase())}
          >
            {capitalizeFirstLetter(item)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

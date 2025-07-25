"use client";

import { useEffect } from "react";
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
import { useLanguageStore } from "@/components/languageManager";
import { useLoadingManager } from "@/components/loadingManager";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemePicker() {
  const { setTheme } = useTheme();
  const { language } = useLanguageStore();
  const { translations, loadTranslations } = useTranslationStore();
  const { registerLoader, hideLoader } = useLoadingManager();

  useEffect(() => {
    if (Object.keys(translations).length === 0) {
      registerLoader();
      loadTranslations().then(() => {
        hideLoader();
      });
    } else {
      hideLoader();
    }
  }, [translations, loadTranslations, hideLoader, registerLoader]);

  const themeOptions = ["light", "dark", "system"];
  const themeItems =
    translations?.[language]?.["theme"] ??
    themeOptions.map(capitalizeFirstLetter);

  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

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

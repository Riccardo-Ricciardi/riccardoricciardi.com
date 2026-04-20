"use client";

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
import { useEnsureTranslations } from "@/utils/hooks/useEnsureTranslations";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemePicker() {
  const { setTheme } = useTheme();
  const { language } = useLanguageStore();
  const { translations } = useTranslationStore();
  useEnsureTranslations();

  const themeOptions = ["light", "dark", "system"];
  const fallbackLabels = ["Light", "Dark", "System"];
  const themeItems = translations?.[language]?.theme ?? fallbackLabels;

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
            key={themeOptions[index]}
            onClick={() => setTheme(themeOptions[index])}
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

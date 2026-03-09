"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { GB, IT } from "country-flag-icons/react/3x2";
import { APP_CONFIG, type SupportedLanguage } from "@/utils/config/app";

interface LanguageStore {
  language: SupportedLanguage;
  setLanguage: (newLanguage: SupportedLanguage) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: APP_CONFIG.defaultLanguage,
      setLanguage: (newLanguage) => set({ language: newLanguage }),
    }),
    { name: "language-store" }
  )
);

export function InitLanguage() {
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  useEffect(() => {
    const persistedLanguage = localStorage.getItem("language-store");
    if (persistedLanguage) return;

    const browserLang = navigator.language.slice(0, 2) as SupportedLanguage;
    if (APP_CONFIG.languages.includes(browserLang)) {
      setLanguage(browserLang);
    }
  }, [setLanguage]);

  return null;
}

export function LanguagePicker() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={`flex items-center gap-2 ${
            language === "en" ? "font-bold" : ""
          }`}
        >
          <GB title="Great Britain" />
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("it")}
          className={`flex items-center gap-2 ${
            language === "it" ? "font-bold" : ""
          }`}
        >
          <IT title="Italy" />
          Italiano
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

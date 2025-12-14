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
import { useLoadingManager } from "@/components/loadingManager";

const supportedLanguages = ["en", "it"];

interface LanguageStore {
  language: string;
  setLanguage: (newLanguage: string) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (newLanguage: string) => set({ language: newLanguage }),
    }),
    { name: "language-store" }
  )
);

export function InitLanguage() {
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { registerLoader, hideLoader } = useLoadingManager();

  useEffect(() => {
    registerLoader();
    const browserLang = navigator.language.slice(0, 2);
    if (supportedLanguages.includes(browserLang)) {
      setLanguage(browserLang);
    }
    hideLoader();
  }, [setLanguage, registerLoader, hideLoader]);

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

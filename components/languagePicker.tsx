"use client";

import * as React from "react";
import { create } from "zustand";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { GB, IT } from "country-flag-icons/react/3x2";

interface LanguageStore {
  language: string;
  setLanguage: (newLanguage: string) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: "en", // Lingua di default
  setLanguage: (newLanguage: string) => set({ language: newLanguage }),
}));

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

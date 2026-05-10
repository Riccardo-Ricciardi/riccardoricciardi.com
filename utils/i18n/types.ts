import type { TranslationTable } from "@/utils/config/app";

export type NavbarItem = {
  slug: string;
  label: string;
  position: number;
};

export type Dictionary = {
  navbar: NavbarItem[];
  theme: string[];
  not_found: string[];
} & Record<TranslationTable, NavbarItem[] | string[]>;

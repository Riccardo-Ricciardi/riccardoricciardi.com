import { createClient } from "@/utils/supabase/client";
import { create } from "zustand";

interface Translation {
  slug: string;
  value: string;
  position?: number;
  language_id: number;
}

interface Translations {
  [languageCode: string]: { [component: string]: string[] };
}

// Funzione per recuperare tutte le traduzioni dal database
export async function fetchTranslations(): Promise<Translations> {
  const supabase = createClient();

  // Recupera le lingue disponibili
  const { data: languages, error: languagesError } = await supabase
    .from("languages")
    .select("code, id");

  if (languagesError) {
    console.error("Errore nel recupero delle lingue:", languagesError.message);
    return {};
  }

  const translations: Translations = {};
  const components = ["competenze", "navbar"];

  for (const { code, id: languageId } of languages) {
    const languageTranslations: { [component: string]: string[] } = {};

    for (const component of components) {
      const { data, error } = await supabase
        .from(component)
        .select("slug, value, position")
        .eq("language_id", languageId);

      if (error) {
        console.error(
          `Errore nel recupero delle traduzioni per ${code} nel componente ${component}:`,
          error.message
        );
        continue;
      }

      const sortedTranslations = (data as Translation[]).sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      );

      languageTranslations[component] = sortedTranslations.map((t) => t.value);
    }

    translations[code] = languageTranslations;
  }

  return translations;
}

// Store Zustand per gestire le traduzioni globalmente
interface TranslationStore {
  translations: Translations;
  loadTranslations: () => Promise<void>;
}

export const useTranslationStore = create<TranslationStore>((set) => ({
  translations: {},
  loadTranslations: async () => {
    try {
      const translations = await fetchTranslations();
      set({ translations });
    } catch (error) {
      console.error("Errore nel caricamento delle traduzioni:", error);
    }
  },
}));

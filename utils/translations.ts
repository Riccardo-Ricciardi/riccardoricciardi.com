import { createClient } from "@/utils/supabase/client";
import { create } from "zustand";

interface TranslationData {
  slug: string;
  value: string;
  position?: number;
  language_id: number;
}

export async function getTranslations(): Promise<{
  [lang: string]: { [component: string]: string[] };
}> {
  const supabase = createClient();

  // Ottieni tutte le lingue disponibili
  const { data: languages, error: languagesError } = await supabase
    .from("languages")
    .select("code, id");

  if (languagesError) {
    console.error("Errore nel recupero delle lingue:", languagesError.message);
    return {};
  }

  const allTranslations: { [lang: string]: { [component: string]: string[] } } =
    {};
  const components = ["competenze", "navbar"]; // Aggiungi altri componenti se necessario

  for (const language of languages) {
    const translationsForLanguage: { [component: string]: string[] } = {};

    for (const component of components) {
      const { data, error } = await supabase
        .from(component)
        .select("slug, value, position")
        .eq("language_id", language.id);

      if (error) {
        console.error(
          `Errore nel recupero delle traduzioni per ${language.code} nel componente ${component}:`,
          error.message
        );
        continue;
      }

      const sortedData = (data as TranslationData[]).sort((a, b) => {
        if (a.position !== undefined && b.position !== undefined) {
          return a.position - b.position;
        }
        return 0;
      });

      translationsForLanguage[component] = sortedData.map((item) => item.value);
    }

    allTranslations[language.code] = translationsForLanguage;
  }

  return allTranslations;
}

interface TranslationsStore {
  translations: { [lang: string]: { [component: string]: string[] } };
  loadAllTranslations: () => Promise<void>;
}

export const useTranslations = create<TranslationsStore>((set) => ({
  translations: {},
  loadAllTranslations: async () => {
    try {
      const data = await getTranslations();
      set({ translations: data });
      // console.log("Traduzioni caricate nello store:", data);
    } catch (error) {
      console.error("Errore nel caricare le traduzioni:", error);
    }
  },
}));

import { createClient, isSupabaseConfigured } from "@/utils/supabase/client";
import { APP_CONFIG, type TranslationTable } from "@/utils/config/app";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TranslationRow {
  value: string;
  position?: number;
}

export interface Translations {
  [languageCode: string]: { [component: string]: string[] };
}

let cachedPromise: Promise<Translations> | null = null;

export async function fetchTranslations(): Promise<Translations> {
  if (!isSupabaseConfigured()) {
    return {};
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    const supabase = createClient();

    const { data: languages, error: languagesError } = await supabase
      .from("languages")
      .select("code, id");

    if (languagesError || !languages) {
      console.error("Errore nel recupero delle lingue:", languagesError?.message);
      return {};
    }

    const translationsByLanguage = await Promise.all(
      languages.map(async ({ code, id: languageId }) => {
        const componentEntries = await Promise.all(
          APP_CONFIG.translationTables.map(async (component: TranslationTable) => {
            const { data, error } = await supabase
              .from(component)
              .select("value, position")
              .eq("language_id", languageId)
              .order("position", { ascending: true });

            if (error) {
              console.error(
                `Errore nel recupero delle traduzioni per ${code} nel componente ${component}:`,
                error.message
              );
              return [component, []] as const;
            }

            const values = ((data ?? []) as TranslationRow[]).map((t) => t.value);
            return [component, values] as const;
          })
        );

        return [code, Object.fromEntries(componentEntries)] as const;
      })
    );

    return Object.fromEntries(translationsByLanguage);
  })();

  return cachedPromise;
}

interface TranslationStore {
  translations: Translations;
  isLoaded: boolean;
  isLoading: boolean;
  loadTranslations: () => Promise<void>;
}

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set, get) => ({
      translations: {},
      isLoaded: false,
      isLoading: false,
      loadTranslations: async () => {
        if (get().isLoaded || get().isLoading) return;

        set({ isLoading: true });

        try {
          const translations = await fetchTranslations();
          set({ translations, isLoaded: true });
        } catch (error) {
          console.error("Errore nel caricamento delle traduzioni:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "translation-store",
      partialize: (state) => ({
        translations: state.translations,
        isLoaded: state.isLoaded,
        isLoading: false,
      }),
    }
  )
);

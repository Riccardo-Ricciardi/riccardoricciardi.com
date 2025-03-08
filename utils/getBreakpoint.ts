import { createClient } from "@/utils/supabase/client";

export const getNavbarBreakpoint = async (
  languageCode: string
): Promise<number | null> => {
  const supabase = createClient();

  try {
    const { data: languages, error: languagesError } = await supabase
      .from("languages")
      .select("code, id");

    if (languagesError) throw languagesError;

    // Trova l'ID della lingua corrispondente al languageCode
    const language = languages.find((lang) => lang.code === languageCode);

    if (!language) {
      throw new Error(`Lingua non trovata per il codice: ${languageCode}`);
    }

    const languageId = language.id;

    if (!languageId) {
      throw new Error(`Lingua non supportata: ${languageCode}`);
    }

    const { data, error } = await supabase
      .from("navbar_breakpoints")
      .select("breakpoint")
      .eq("language_id", languageId)
      .single();

    if (error) throw error;

    return data ? data.breakpoint : null;
  } catch (error) {
    console.error(
      "Errore nel recupero del breakpoint:",
      (error as Error).message
    );
    return null;
  }
};

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import { useLanguageStore } from "@/components/languagePicker";

interface DeviceStore {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
}

const useDeviceStore = create<DeviceStore>((set) => ({
  isMobile: false,
  setIsMobile: (value) => set({ isMobile: value }),
}));

export const useIsMobile = () => {
  const { language } = useLanguageStore();
  const { isMobile, setIsMobile } = useDeviceStore();
  const [breakpoint, setBreakpoint] = useState<number | null>(null);

  useEffect(() => {
    const fetchBreakpoint = async () => {
      const supabase = createClient();

      const { data: langData, error: langError } = await supabase
        .from("languages")
        .select("id")
        .eq("code", language)
        .single();

      if (langError || !langData) {
        console.error(
          "Errore nel recupero dell'ID della lingua:",
          langError?.message
        );
        return;
      }

      const languageId = langData.id;

      const { data, error } = await supabase
        .from("breakpoints")
        .select("breakpoint")
        .eq("language_id", languageId)
        .single();

      if (error) {
        console.error("Errore nel recupero del breakpoint:", error.message);
        return;
      }

      if (data) {
        setBreakpoint(data.breakpoint);
        // console.log("Breakpoint recuperato:", data.breakpoint);
      }
    };

    fetchBreakpoint();
  }, [language]);

  useEffect(() => {
    if (breakpoint !== null) {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= breakpoint);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }
  }, [breakpoint, setIsMobile]);

  return isMobile;
};

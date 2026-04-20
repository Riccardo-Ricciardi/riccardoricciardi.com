"use client";

import { useEffect } from "react";
import { useLoadingManager } from "@/components/loadingManager";
import { useTranslationStore } from "@/utils/useTranslations";

export function useEnsureTranslations() {
  const { withLoader } = useLoadingManager();
  const { isLoaded, loadTranslations } = useTranslationStore();

  useEffect(() => {
    if (isLoaded) return;
    void withLoader(loadTranslations());
  }, [isLoaded, loadTranslations, withLoader]);
}

"use client";

import { useEffect } from "react";
import { useLoadingManager } from "@/components/loadingManager";
import { useTranslationStore } from "@/utils/useTranslations";

export function useEnsureTranslations() {
  const { withLoader } = useLoadingManager();
  const { isLoaded, isLoading, loadTranslations } = useTranslationStore();

  useEffect(() => {
    if (isLoaded || isLoading) return;
    void withLoader(loadTranslations());
  }, [isLoaded, isLoading, loadTranslations, withLoader]);
}

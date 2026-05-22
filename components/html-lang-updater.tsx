"use client";

import { useEffect, useRef } from "react";

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  it: "Italiano",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  pt: "Português",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  nl: "Nederlands",
  pl: "Polski",
};

export function HtmlLangUpdater({ lang }: { lang: string }) {
  const prevLangRef = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    prevLangRef.current = lang;
  }, [lang]);

  const announce =
    prevLangRef.current && prevLangRef.current !== lang
      ? `Language changed to ${LOCALE_NAMES[lang] ?? lang}`
      : "";

  return (
    <output
      key={lang}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announce}
    </output>
  );
}

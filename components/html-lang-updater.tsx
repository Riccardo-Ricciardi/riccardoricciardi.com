"use client";

import { useEffect, useRef, useState } from "react";

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
  const prevLang = useRef<string | null>(null);
  const [announce, setAnnounce] = useState<string>("");

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    if (prevLang.current && prevLang.current !== lang) {
      const name = LOCALE_NAMES[lang] ?? lang;
      setAnnounce(`Language changed to ${name}`);
    }
    prevLang.current = lang;
  }, [lang]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announce}
    </div>
  );
}

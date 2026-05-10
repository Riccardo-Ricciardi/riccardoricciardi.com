"use client";

import { useState, type ReactNode } from "react";

export interface LangTab {
  id: number;
  code: string;
  name: string;
}

interface LangTabsProps {
  langs: LangTab[];
  panels: ReactNode[];
  storageKey?: string;
}

export function LangTabs({ langs, panels, storageKey }: LangTabsProps) {
  const [active, setActive] = useState<string>(() => {
    if (typeof window !== "undefined" && storageKey) {
      const saved = window.localStorage.getItem(storageKey);
      if (saved && langs.some((l) => l.code === saved)) return saved;
    }
    return langs[0]?.code ?? "";
  });

  const handleSelect = (code: string) => {
    setActive(code);
    if (typeof window !== "undefined" && storageKey) {
      window.localStorage.setItem(storageKey, code);
    }
  };

  if (langs.length === 0) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Language tabs"
        className="mb-4 flex flex-wrap gap-1 border-b border-dashed border-dashed-soft"
      >
        {langs.map((lang) => {
          const isActive = active === lang.code;
          return (
            <button
              key={lang.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(lang.code)}
              className={`-mb-px border-b-2 px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "border-accent-blue text-accent-blue"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang.code} · {lang.name}
            </button>
          );
        })}
      </div>
      {langs.map((lang, i) => (
        <div
          key={lang.id}
          role="tabpanel"
          aria-labelledby={`tab-${lang.code}`}
          hidden={active !== lang.code}
        >
          {panels[i]}
        </div>
      ))}
    </div>
  );
}

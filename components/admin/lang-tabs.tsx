"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [active, setActive] = useState<string>(langs[0]?.code ?? "");

  useEffect(() => {
    if (!storageKey) return;
    const saved = window.localStorage.getItem(storageKey);
    if (saved && langs.some((l) => l.code === saved)) setActive(saved);
  }, [storageKey, langs]);

  const handleChange = (val: string) => {
    setActive(val);
    if (storageKey) window.localStorage.setItem(storageKey, val);
  };

  if (langs.length === 0) return null;

  return (
    <Tabs value={active} onValueChange={handleChange} className="w-full">
      <TabsList>
        {langs.map((lang) => (
          <TabsTrigger key={lang.id} value={lang.code} className="font-mono text-[10px] uppercase tracking-wider">
            {lang.code}
          </TabsTrigger>
        ))}
      </TabsList>
      {langs.map((lang, i) => (
        <TabsContent key={lang.id} value={lang.code}>
          {panels[i]}
        </TabsContent>
      ))}
    </Tabs>
  );
}

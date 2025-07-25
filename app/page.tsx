"use client";

import Navbar from "@/components/navbar";
import Skills from "@/components/skills";
import { useLanguageStore } from "@/components/languageManager";

export default function Page() {
  const language = useLanguageStore((state) => state.language);

  return (
    <>
      <Navbar language={language} table="navbar" />
      <Skills language={language} />
    </>
  );
}

"use client";

import Navbar from "@/components/navbar";
import { useLanguageStore } from "@/components/languagePicker";
import { useIsMobile } from "@/utils/useIsMobile";

export default function Page() {
  const { language } = useLanguageStore();
  const isMobile = useIsMobile();

  return (
    <>
      <Navbar language={language} table="navbar" isMobile={isMobile} />
    </>
  );
}

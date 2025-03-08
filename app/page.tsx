"use client";

import Navbar from "@/components/navbar";
import { useLanguageStore } from "@/components/languagePicker";

export default function Page() {
  const { language } = useLanguageStore();

  return (
    <>
      <Navbar lang={language} table="navbar" mobileThreshold={510}/>
    </>
  );
}

"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/components/languageManager";
import { useTranslationStore } from "@/utils/useTranslations";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  const { language } = useLanguageStore();
  const { translations, loadTranslations } = useTranslationStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (Object.keys(translations).length === 0) {
      loadTranslations().then(() => setIsMounted(true));
    } else {
      setIsMounted(true);
    }
  }, [translations, loadTranslations]);

  const translation = translations?.[language]?.["not-found"] ?? [];

  if (!isMounted) return null;

  return (
    <div
      className="mx-auto flex items-center justify-center py-12 px-4 h-screen"
      style={{ width: "clamp(0px, 80%, 1200px)" }}
    >
      <Card className="w-full max-w-md border-grid shadow-none p-6 flex flex-col items-center text-center">
        <CardHeader className="p-0 mb-6 w-full">
          <h1
            className="text-red-600 font-extrabold text-center w-full leading-none"
            style={{ fontSize: "clamp(6rem, 20vw, 12rem)" }}
          >
            404
          </h1>
        </CardHeader>
        <CardContent className="p-0 flex flex-col gap-6 w-full">
          <p className="text-base text-muted-foreground">{translation[0]}</p>
          <Link href="/" passHref>
            <Button className="w-full bg-red-600 text-white text-lg py-4 px-8 rounded-md hover:bg-red-700 transition-colors">
              {translation[1]}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

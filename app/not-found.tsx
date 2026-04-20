"use client";

import Link from "next/link";

import { useTranslationStore } from "@/utils/useTranslations";
import { useLanguageStore } from "@/components/languageManager";
import { useEnsureTranslations } from "@/utils/hooks/useEnsureTranslations";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NotFound() {
  const { language } = useLanguageStore();
  const { translations } = useTranslationStore();
  useEnsureTranslations();

  const translation = translations?.[language]?.["not-found"] ?? [];

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
          <Link href="/">
            <Button className="w-full bg-red-600 text-white text-lg py-4 px-8 rounded-md hover:bg-red-700 transition-colors">
              {translation[1]}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

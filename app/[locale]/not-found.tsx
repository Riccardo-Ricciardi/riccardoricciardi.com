import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDictionary } from "@/utils/i18n/dictionary";
import {
  APP_CONFIG,
  isSupportedLanguage,
  type SupportedLanguage,
} from "@/utils/config/app";
import { headers } from "next/headers";

async function detectLocale(): Promise<SupportedLanguage> {
  const h = await headers();
  const url = h.get("x-invoke-path") ?? h.get("referer") ?? "";
  const seg = url.split("/").filter(Boolean)[0];
  if (seg && isSupportedLanguage(seg)) return seg;
  return APP_CONFIG.defaultLanguage;
}

export default async function LocaleNotFound() {
  const locale = await detectLocale();
  const dict = await getDictionary(locale);
  const [message, cta] = dict["not-found"] as string[];

  return (
    <div
      className="mx-auto flex h-screen items-center justify-center px-4 py-12"
      style={{ width: "clamp(0px, 80%, 1200px)" }}
    >
      <Card className="flex w-full max-w-md flex-col items-center border-grid p-6 text-center shadow-none">
        <CardHeader className="mb-6 w-full p-0">
          <h1
            className="w-full text-center font-extrabold leading-none text-red-600"
            style={{ fontSize: "clamp(6rem, 20vw, 12rem)" }}
          >
            404
          </h1>
        </CardHeader>
        <CardContent className="flex w-full flex-col gap-6 p-0">
          <p className="text-base text-muted-foreground">
            {message ?? (locale === "it" ? "Pagina non trovata" : "Page not found")}
          </p>
          <Link href={`/${locale}`}>
            <Button className="w-full rounded-md bg-red-600 px-8 py-4 text-lg text-white transition-colors hover:bg-red-700">
              {cta ?? (locale === "it" ? "Torna alla home" : "Back to home")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDictionary } from "@/utils/i18n/dictionary";
import { APP_CONFIG } from "@/utils/config/app";

export default async function LocaleNotFound() {
  const locale = APP_CONFIG.defaultLanguage;
  const dict = await getDictionary(locale);
  const messages = dict["not-found"] as string[];
  const message = messages?.[0] ?? "Page not found";
  const cta = messages?.[1] ?? "Back to home";

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
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
          <p className="text-base text-muted-foreground">{message}</p>
          <Link href={`/${locale}`}>
            <Button className="w-full rounded-md bg-red-600 px-8 py-4 text-lg text-white transition-colors hover:bg-red-700">
              {cta}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/utils/i18n/dictionary";
import { APP_CONFIG } from "@/utils/config/app";

export default async function LocaleNotFound() {
  const locale = APP_CONFIG.defaultLanguage;
  const dict = await getDictionary(locale);
  const messages = dict.not_found as string[];
  const message = messages?.[0] ?? "Page not found";
  const cta = messages?.[1] ?? "Back to home";

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-dot bg-dot-mask pointer-events-none absolute inset-0 -z-10"
      />
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Error 404
          </p>
          <h1 className="mt-4 text-balance text-6xl font-semibold tracking-tight leading-[1.05] md:text-8xl">
            {message}
          </h1>
          <p className="mt-6 max-w-md text-balance text-lg text-muted-foreground">
            {(locale as string) === "it"
              ? "La pagina che cercavi non esiste o è stata spostata."
              : "The page you were looking for doesn't exist or has been moved."}
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href={`/${locale}`}>
              <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
              {cta}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

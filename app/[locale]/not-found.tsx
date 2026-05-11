import Link from "next/link";
import { cookies, headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MouseParticles } from "@/components/mouse-particles";
import { isSupportedLanguage } from "@/utils/config/app";
import { getDefaultLanguageCode } from "@/utils/i18n/languages";

async function detectLocale(): Promise<string> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isSupportedLanguage(cookieLocale)) return cookieLocale;

  const headerStore = await headers();
  const accept = headerStore.get("accept-language") ?? "";
  const preferred = accept.split(",")[0]?.split("-")[0]?.toLowerCase() ?? "";
  if (isSupportedLanguage(preferred)) return preferred;

  return getDefaultLanguageCode();
}

const COPY = {
  en: {
    eyebrow: "Error 404",
    title: "Page not found",
    description: "The page you were looking for doesn't exist or has been moved.",
    cta: "Back to home",
  },
  it: {
    eyebrow: "Errore 404",
    title: "Pagina non trovata",
    description: "La pagina che cercavi non esiste o è stata spostata.",
    cta: "Torna alla home",
  },
} as const;

export default async function LocaleNotFound() {
  const locale = await detectLocale();
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-dot bg-dot-mask pointer-events-none absolute inset-0 -z-20"
      />
      <div
        aria-hidden="true"
        className="gradient-glow pointer-events-none absolute inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <MouseParticles count={40} linkDistance={100} repelRadius={120} />
      </div>
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-6xl font-semibold tracking-tight leading-[1.05] md:text-8xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-md text-balance text-lg text-muted-foreground">
            {copy.description}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-accent-blue text-white hover:bg-[var(--accent-blue-hover)]"
          >
            <Link href={`/${locale}`}>
              <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
              {copy.cta}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

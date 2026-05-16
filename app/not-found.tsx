import Link from "next/link";
import { cookies, headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { SkipLink } from "@/components/skip-link";
import { HtmlLangUpdater } from "@/components/html-lang-updater";
import { MouseParticles } from "@/components/mouse-particles";
import { Eyebrow } from "@/components/site/atoms/eyebrow";
import { getDictionary } from "@/utils/i18n/dictionary";
import { isSupportedLanguage } from "@/utils/config/app";
import {
  getDefaultLanguageCode,
  getLanguages,
} from "@/utils/i18n/languages";

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
    aria: {
      nav: "Main navigation",
      menu: "Open menu",
      menuClose: "Close menu",
      menuTitle: "Menu",
      language: "Change language",
      theme: "Toggle theme",
      home: "Riccardo Ricciardi - Home",
      skip: "Skip to main content",
    },
  },
  it: {
    eyebrow: "Errore 404",
    title: "Pagina non trovata",
    description: "La pagina che cercavi non esiste o è stata spostata.",
    cta: "Torna alla home",
    aria: {
      nav: "Navigazione principale",
      menu: "Apri menu",
      menuClose: "Chiudi menu",
      menuTitle: "Menu",
      language: "Cambia lingua",
      theme: "Cambia tema",
      home: "Riccardo Ricciardi - Home",
      skip: "Vai al contenuto principale",
    },
  },
} as const;

export default async function NotFound() {
  const locale = await detectLocale();
  const [dictionary, languageRows] = await Promise.all([
    getDictionary(locale),
    getLanguages(),
  ]);
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const languageOptions = languageRows.map((l) => ({
    code: l.code,
    name: l.name,
  }));

  return (
    <>
      <HtmlLangUpdater lang={locale} />
      <SkipLink label={copy.aria.skip} />
      <Navbar
        locale={locale}
        dictionary={dictionary}
        languages={languageOptions}
        ariaLabels={copy.aria}
      />
      <main id="main" className="flex-1">
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
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
          <div className="container-page section-y">
            <div className="content-narrow flex flex-col items-center text-center">
              <Eyebrow>{copy.eyebrow}</Eyebrow>
              <h1 className="text-display mt-4 text-balance">
                {copy.title}
              </h1>
              <p className="text-body-lg mt-6 max-w-md text-balance text-muted-foreground">
                {copy.description}
              </p>
              <Link
                href={`/${locale}`}
                className="btn-base btn-lg btn-primary mt-8"
              >
                <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                {copy.cta}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}

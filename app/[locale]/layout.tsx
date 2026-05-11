import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { SkipLink } from "@/components/skip-link";
import { JsonLd } from "@/components/json-ld";
import { HtmlLangUpdater } from "@/components/html-lang-updater";
import { APP_CONFIG } from "@/utils/config/app";
import {
  getDefaultLanguageCode,
  getLanguageCodes,
  getLanguages,
  isKnownLocale,
} from "@/utils/i18n/languages";
import { getDictionary } from "@/utils/i18n/dictionary";

export async function generateStaticParams() {
  const codes = await getLanguageCodes();
  return codes.map((code) => ({ locale: code }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) return {};

  const title = APP_CONFIG.siteName;
  const description =
    locale === "it"
      ? "Il sito ufficiale di Riccardo Ricciardi"
      : "The official website of Riccardo Ricciardi";

  const baseUrl = APP_CONFIG.siteUrl;
  const path = `/${locale}`;

  const [codes, defaultCode] = await Promise.all([
    getLanguageCodes(),
    getDefaultLanguageCode(),
  ]);

  const languages = Object.fromEntries(
    codes.map((l) => [l, `${baseUrl}/${l}`])
  );

  return {
    metadataBase: new URL(baseUrl),
    title: { default: title, template: `%s | ${title}` },
    description,
    applicationName: title,
    authors: [{ name: APP_CONFIG.author.name }],
    creator: APP_CONFIG.author.name,
    publisher: APP_CONFIG.author.name,
    alternates: {
      canonical: path,
      languages: { ...languages, "x-default": `${baseUrl}/${defaultCode}` },
    },
    openGraph: {
      type: "website",
      url: `${baseUrl}${path}`,
      siteName: title,
      title,
      description,
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    icons: { icon: "/logo.png" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const [dictionary, languageRows] = await Promise.all([
    getDictionary(locale),
    getLanguages(),
  ]);
  const languageOptions = languageRows.map((l) => ({
    code: l.code,
    name: l.name,
  }));

  const ariaLabels =
    locale === "it"
      ? {
          nav: "Navigazione principale",
          menu: "Apri menu",
          language: "Cambia lingua",
          theme: "Cambia tema",
          home: "Riccardo Ricciardi - Home",
          skip: "Vai al contenuto principale",
        }
      : {
          nav: "Main navigation",
          menu: "Open menu",
          language: "Change language",
          theme: "Toggle theme",
          home: "Riccardo Ricciardi - Home",
          skip: "Skip to main content",
        };

  return (
    <>
      <HtmlLangUpdater lang={locale} />
      <SkipLink label={ariaLabels.skip} />
      <Navbar
        locale={locale}
        dictionary={dictionary}
        languages={languageOptions}
        ariaLabels={ariaLabels}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
      <JsonLd locale={locale} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { SmoothScroll } from "@/components/site/fx/smooth-scroll";
import { SkipLink } from "@/components/skip-link";
import { JsonLd } from "@/components/json-ld";
import { HtmlLangUpdater } from "@/components/html-lang-updater";
import { ErrorCopyProvider } from "@/components/site/error-copy-context";
import { APP_CONFIG } from "@/utils/config/app";
import {
  getDefaultLanguageCode,
  getLanguageCodes,
  getLanguages,
  isKnownLocale,
} from "@/utils/i18n/languages";
import { getDictionary } from "@/utils/i18n/dictionary";
import { content, getContentBlocks } from "@/utils/content/fetch";

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

  const baseUrl = APP_CONFIG.siteUrl;
  const path = `/${locale}`;

  const [codes, defaultCode, blocks] = await Promise.all([
    getLanguageCodes(),
    getDefaultLanguageCode(),
    getContentBlocks(locale),
  ]);

  const description = content(blocks, "meta_home_description", "");

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

  const [dictionary, languageRows, blocks] = await Promise.all([
    getDictionary(locale),
    getLanguages(),
    getContentBlocks(locale),
  ]);
  const languageOptions = languageRows.map((l) => ({
    code: l.code,
    name: l.name,
  }));

  const ariaLabels = {
    nav: content(blocks, "aria_nav", ""),
    menu: content(blocks, "aria_menu", ""),
    language: content(blocks, "aria_language", ""),
    theme: content(blocks, "aria_theme", ""),
    home: content(blocks, "aria_home", ""),
    skip: content(blocks, "aria_skip", ""),
  };

  const errorCopy = {
    eyebrow: content(blocks, "error_eyebrow", ""),
    title: content(blocks, "error_title", ""),
    description: content(blocks, "error_description", ""),
    retry: content(blocks, "error_retry", ""),
    home: content(blocks, "error_home", ""),
  };

  return (
    <>
      <HtmlLangUpdater lang={locale} />
      <SmoothScroll />
      <div className="surface-grain" aria-hidden="true" />
      <SkipLink label={ariaLabels.skip} />
      <Navbar
        locale={locale}
        dictionary={dictionary}
        languages={languageOptions}
        ariaLabels={ariaLabels}
      />
      <ErrorCopyProvider copy={errorCopy}>
        <main id="main" className="flex-1">
          {children}
        </main>
      </ErrorCopyProvider>
      <Footer locale={locale} />
      <JsonLd locale={locale} />
    </>
  );
}

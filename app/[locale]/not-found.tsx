import Link from "next/link";
import { cookies, headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { Eyebrow } from "@/components/site/atoms/eyebrow";
import { isSupportedLanguage } from "@/utils/config/app";
import { getDefaultLanguageCode } from "@/utils/i18n/languages";
import { content, getContentBlocks } from "@/utils/content/fetch";

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

export default async function LocaleNotFound() {
  const locale = await detectLocale();
  const blocks = await getContentBlocks(locale);
  const copy = {
    eyebrow: content(blocks, "notfound_eyebrow", ""),
    title: content(blocks, "notfound_title", ""),
    description: content(blocks, "notfound_description", ""),
    cta: content(blocks, "notfound_cta", ""),
  };

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-scan pointer-events-none absolute inset-0 -z-10"
      />
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
            <ArrowLeft className="mr-1 size-4" aria-hidden="true" />
            {copy.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

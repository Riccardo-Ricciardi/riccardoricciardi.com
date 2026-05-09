import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skills } from "@/components/skills";
import { isSupportedLanguage } from "@/utils/config/app";
import { APP_CONFIG } from "@/utils/config/app";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLanguage(locale)) notFound();

  const heading = locale === "it" ? "Le mie competenze" : "My skills";

  return (
    <Suspense
      fallback={
        <section className="container-page py-10" aria-busy="true">
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        </section>
      }
    >
      <Skills heading={heading} />
    </Suspense>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return APP_CONFIG.languages.map((locale) => ({ locale }));
}

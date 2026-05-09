import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skills } from "@/components/skills";
import { GlobalLoader } from "@/components/global-loader";
import { isSupportedLanguage } from "@/utils/config/app";
import { APP_CONFIG } from "@/utils/config/app";

export const dynamic = "force-static";
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLanguage(locale)) notFound();

  const heading = locale === "it" ? "Le mie competenze" : "My skills";

  return (
    <Suspense fallback={<GlobalLoader fullscreen />}>
      <Skills heading={heading} />
    </Suspense>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return APP_CONFIG.languages.map((locale) => ({ locale }));
}

import { APP_CONFIG, type SupportedLanguage } from "@/utils/config/app";

interface JsonLdProps {
  locale: SupportedLanguage;
}

export function JsonLd({ locale }: JsonLdProps) {
  const baseUrl = APP_CONFIG.siteUrl;
  const url = `${baseUrl}/${locale}`;

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: APP_CONFIG.author.name,
    url: baseUrl,
    email: APP_CONFIG.author.email,
    sameAs: APP_CONFIG.author.sameAs,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_CONFIG.siteName,
    url,
    inLanguage: locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

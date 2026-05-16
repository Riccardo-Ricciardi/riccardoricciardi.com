import { getSkills } from "@/utils/skills/fetch";
import { SkillsVariantA } from "@/components/site/skills/variant-a";
import { SkillsVariantB } from "@/components/site/skills/variant-b";
import { SkillsVariantC } from "@/components/site/skills/variant-c";
import { Heading } from "@/components/site/atoms/heading";
import { Eyebrow } from "@/components/site/atoms/eyebrow";
import { getLanguageCodes } from "@/utils/i18n/languages";

export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const codes = await getLanguageCodes();
  return codes.map((code) => ({ locale: code }));
}

export const metadata = {
  title: "Skills preview",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SkillsPreviewPage({ params }: PageProps) {
  const { locale } = await params;
  const skills = await getSkills();
  const isIt = locale === "it";

  const variants = [
    {
      key: "A",
      title: isIt ? "A — Vercel integrations grid" : "A — Vercel integrations grid",
      description: isIt
        ? "Card 4-col con icona brand colorata + tier pill mono."
        : "4-col cards with colored brand icon + mono tier pill.",
      node: <SkillsVariantA skills={skills} locale={locale} />,
    },
    {
      key: "B",
      title: isIt
        ? "B — GitHub language bar + dense list"
        : "B — GitHub language bar + dense list",
      description: isIt
        ? "Barra distribuzione tier in alto + lista densa 3-col con dot colorati."
        : "Tier distribution bar on top + dense 3-col list with colored dots.",
      node: <SkillsVariantB skills={skills} locale={locale} />,
    },
    {
      key: "C",
      title: isIt
        ? "C — Wordmark wall + pills + mono row"
        : "C — Wordmark wall + pills + mono row",
      description: isIt
        ? "Core come wordmark grid grande, Proficient come pills, Familiari come riga mono."
        : "Core as big wordmark grid, Proficient as pills, Familiar as mono row.",
      node: <SkillsVariantC skills={skills} locale={locale} />,
    },
  ];

  return (
    <main id="main" className="container-page section-y">
      <Heading
        level="h1"
        eyebrow={isIt ? "Preview interna" : "Internal preview"}
        title={isIt ? "Skills — 3 varianti" : "Skills — 3 variants"}
        subtitle={
          isIt
            ? "Scorri e confronta. Testa su desktop e mobile. Quando hai scelto, dimmi la lettera (A, B, C) e wiro la scelta nella homepage."
            : "Scroll and compare. Test on desktop and mobile. When you pick one, tell me the letter (A, B, C) and I'll wire it into the homepage."
        }
        className="mb-12"
      />

      <div className="flex flex-col gap-20">
        {variants.map((v) => (
          <section
            key={v.key}
            aria-labelledby={`variant-${v.key}`}
            className="flex flex-col gap-6 border-t border-border pt-10"
          >
            <header>
              <Eyebrow>
                {isIt ? "Variante" : "Variant"} {v.key}
              </Eyebrow>
              <h2
                id={`variant-${v.key}`}
                className="text-h2 mt-2 tracking-tight"
              >
                {v.title}
              </h2>
              <p className="text-body-sm mt-2 max-w-prose text-muted-foreground">
                {v.description}
              </p>
            </header>
            <div>{v.node}</div>
          </section>
        ))}
      </div>
    </main>
  );
}

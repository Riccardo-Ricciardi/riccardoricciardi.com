import { getSkills } from "@/utils/skills/fetch";
import { SkillsVariantA } from "@/components/site/skills/variant-a";
import { SkillsVariantB } from "@/components/site/skills/variant-b";
import { SkillsVariantC } from "@/components/site/skills/variant-c";
import { SkillsVariantE } from "@/components/site/skills/variant-e";
import { SkillsVariantH } from "@/components/site/skills/variant-h";
import { SkillsVariantJ } from "@/components/site/skills/variant-j";
import { SkillsVariantK } from "@/components/site/skills/variant-k";
import { SkillsVariantM } from "@/components/site/skills/variant-m";
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
      title: "A — Card grid w/ icon",
      description: isIt
        ? "Card 4-col con icona brand + percentuale mono a destra."
        : "4-col cards with brand icon and right-aligned percent.",
      node: <SkillsVariantA skills={skills} locale={locale} />,
    },
    {
      key: "B",
      title: "B — Dotted dense list",
      description: isIt
        ? "Lista densa 3-col con dot e percentuale."
        : "Dense 3-col list with dot and percentage.",
      node: <SkillsVariantB skills={skills} locale={locale} />,
    },
    {
      key: "C",
      title: "C — Wordmark wall",
      description: isIt
        ? "Grid wordmark, nome grande con percentuale mono sotto."
        : "Wordmark grid, big name with mono percentage underneath.",
      node: <SkillsVariantC skills={skills} locale={locale} />,
    },
    {
      key: "E",
      title: "E — Editorial table",
      description: isIt
        ? "Tabella tipografica con indice, nome e barra percentuale."
        : "Typographic table with index, name and percent bar.",
      node: <SkillsVariantE skills={skills} locale={locale} />,
    },
    {
      key: "H",
      title: "H — Marquee ticker",
      description: isIt
        ? "Tre righe in scorrimento continuo, hover-pausa, alternate per direzione."
        : "Three continuously scrolling rows, hover-pause, alternating direction.",
      node: <SkillsVariantH skills={skills} locale={locale} />,
    },
    {
      key: "J",
      title: "J — Big number grid",
      description: isIt
        ? "Card con percentuale gigante in cima, nome sotto."
        : "Cards with giant percentage on top, name underneath.",
      node: <SkillsVariantJ skills={skills} locale={locale} />,
    },
    {
      key: "K",
      title: "K — Underline meter",
      description: isIt
        ? "Riga sottile sotto al nome, larghezza = percentuale."
        : "Thin underline below the name, width = percentage.",
      node: <SkillsVariantK skills={skills} locale={locale} />,
    },
    {
      key: "M",
      title: "M — Bento (size = depth, center = top skill)",
      description: isIt
        ? "Card bento: dimensione legata alla percentuale, skill principale al centro circondata dalle altre."
        : "Bento cards: size driven by percentage, top skill centered with the rest packed around it.",
      node: <SkillsVariantM skills={skills} locale={locale} />,
    },
  ];

  return (
    <main id="main" className="container-page section-y">
      <Heading
        level="h1"
        eyebrow={isIt ? "Preview interna" : "Internal preview"}
        title={
          isIt
            ? `Skills — ${variants.length} varianti`
            : `Skills — ${variants.length} variants`
        }
        subtitle={
          isIt
            ? "Solo nome + percentuale. Scorri, confronta, e dimmi la lettera che ti piace."
            : "Name + percentage only. Scroll, compare, and reply with the letter you want."
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

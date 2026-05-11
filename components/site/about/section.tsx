import Image from "next/image";
import { getAboutSections } from "@/utils/about/fetch";
import { getSiteIdentity } from "@/utils/identity/fetch";
import type { SupportedLanguage } from "@/utils/config/app";
import { SectionHeading } from "@/components/site/atoms/section-heading";
import { Eyebrow } from "@/components/site/atoms/eyebrow";

interface AboutProps {
  heading: string;
  eyebrow?: string;
  subtitle?: string;
  locale: SupportedLanguage;
}

export async function About({ heading, eyebrow, subtitle, locale }: AboutProps) {
  const [sections, identity] = await Promise.all([
    getAboutSections(locale),
    getSiteIdentity(),
  ]);

  return (
    <section
      aria-labelledby="about-heading"
      className="container-page section-divider-b section-y"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="about-heading"
        className="mb-12 md:mb-16"
      />

      <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-14 lg:gap-20">
        <aside className="md:sticky md:top-24 md:self-start">
          {identity.profile_photo_url ? (
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-dashed-soft">
              <Image
                src={identity.profile_photo_url}
                alt={identity.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="grid aspect-[4/5] w-full max-w-sm place-items-center rounded-2xl border border-dashed-soft bg-muted/30">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {identity.name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            </div>
          )}
          <Eyebrow className="mt-4">{identity.name}</Eyebrow>
        </aside>

        <div className="flex flex-col gap-10">
          {sections.length === 0 ? (
            <p className="text-body-lg text-muted-foreground">
              {locale === "it"
                ? "Sto ancora scrivendo questa pagina."
                : "Still writing this page."}
            </p>
          ) : (
            sections.map((section, i) => (
              <article key={section.id} className="flex flex-col gap-3">
                <div className="flex items-baseline gap-3">
                  <Eyebrow as="span" className="tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </Eyebrow>
                  {section.heading && (
                    <h3 className="text-h3">{section.heading}</h3>
                  )}
                </div>
                <div className="text-body-lg ml-9 whitespace-pre-line text-foreground/85">
                  {section.body}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

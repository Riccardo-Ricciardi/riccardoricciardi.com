import Image from "next/image";
import { getAboutSections } from "@/utils/about/fetch";
import { getSiteIdentity } from "@/utils/identity/fetch";
import type { SupportedLanguage } from "@/utils/config/app";
import { SectionHeading } from "@/components/site/atoms/section-heading";

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
      className="container-page section-divider-b py-16 md:py-24 lg:py-28"
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
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-dashed border-dashed-soft">
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
            <div className="grid aspect-[4/5] w-full max-w-sm place-items-center rounded-2xl border border-dashed border-dashed-soft bg-muted/30">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {identity.name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            </div>
          )}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {identity.name}
          </p>
        </aside>

        <div className="flex flex-col gap-10">
          {sections.length === 0 ? (
            <p className="text-base leading-relaxed text-muted-foreground">
              {locale === "it"
                ? "Sto ancora scrivendo questa pagina."
                : "Still writing this page."}
            </p>
          ) : (
            sections.map((section, i) => (
              <article key={section.id} className="flex flex-col gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.heading && (
                    <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
                      {section.heading}
                    </h3>
                  )}
                </div>
                <div className="ml-9 whitespace-pre-line text-base leading-relaxed text-foreground/85 md:text-lg">
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

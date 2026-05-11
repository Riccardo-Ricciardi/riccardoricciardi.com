import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAboutSections } from "@/utils/about/fetch";
import { getSiteIdentity } from "@/utils/identity/fetch";
import type { SupportedLanguage } from "@/utils/config/app";

interface AboutTeaserProps {
  locale: SupportedLanguage;
  eyebrow: string;
  heading: string;
  fallbackBody: string;
  readMoreLabel: string;
  contactLabel: string;
}

export async function AboutTeaser({
  locale,
  eyebrow,
  heading,
  fallbackBody,
  readMoreLabel,
  contactLabel,
}: AboutTeaserProps) {
  const [sections, identity] = await Promise.all([
    getAboutSections(locale),
    getSiteIdentity(),
  ]);

  const body = sections[0]?.body?.trim() || fallbackBody;
  const paragraphs = body.split(/\n{2,}/).slice(0, 2);

  return (
    <section
      id="about"
      aria-labelledby="about-teaser-heading"
      className="container-page section-divider-b py-16 md:py-20 lg:py-24"
    >
      <div className="grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-14">
        {identity.profile_photo_url ? (
          <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-2xl border border-dashed-soft sm:w-40 md:w-48">
            <Image
              src={identity.profile_photo_url}
              alt={identity.name}
              fill
              sizes="(max-width: 768px) 160px, 192px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="grid aspect-square w-32 shrink-0 place-items-center rounded-2xl border border-dashed-soft bg-muted/30 sm:w-40 md:w-48">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {identity.name
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-5">
          <header className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </span>
            <h2
              id="about-teaser-heading"
              className="text-balance text-3xl font-semibold tracking-tight md:text-4xl"
            >
              {heading}
            </h2>
          </header>

          <div className="flex flex-col gap-3 text-base leading-relaxed text-foreground/85 md:text-lg">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href={`/${locale}/about`}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent-blue"
            >
              {readMoreLabel}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent-blue hover:text-[var(--accent-blue-hover)]"
            >
              {contactLabel}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

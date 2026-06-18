import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { getAboutSections } from "@/utils/about/fetch";
import { getSiteIdentity } from "@/utils/identity/fetch";
import type { SupportedLanguage } from "@/utils/config/app";
import { Heading } from "@/components/site/atoms/heading";
import { EmptyState } from "@/components/site/atoms/empty-state";

interface AboutCta {
  label: string;
  href: string;
}

interface AboutFacts {
  location: string;
  languages: string;
  availability: string;
}

interface MakerCell {
  label: string;
  line: string;
}

interface AboutProps {
  heading: string;
  subtitle?: string;
  locale: SupportedLanguage;
  facts: AboutFacts;
  pullQuote: string;
  makerHeading: string;
  makerCells: MakerCell[];
  makerUsesCell: MakerCell;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: AboutCta;
  primaryCta: AboutCta;
  secondaryCta: AboutCta;
}

export async function About({
  heading,
  subtitle,
  locale,
  facts,
  pullQuote,
  makerHeading,
  makerCells,
  makerUsesCell,
  emptyTitle,
  emptyBody,
  emptyCta,
  primaryCta,
  secondaryCta,
}: AboutProps) {
  const [sections, identity] = await Promise.all([
    getAboutSections(locale),
    getSiteIdentity(),
  ]);

  const initials = identity.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section
      aria-labelledby="about-heading"
      className="container-page section-divider-b section-y"
    >
      <Heading
        level="h1"
        title={heading}
        subtitle={subtitle}
        id="about-heading"
        className="mb-12 md:mb-16"
      />

      <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-12 lg:gap-16">
        <aside className="md:sticky md:top-24 md:self-start">
          {identity.profile_photo_url ? (
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-surface border border-border">
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
            <div className="grid aspect-[4/5] w-full max-w-sm place-items-center rounded-surface bg-muted">
              <span className="font-mono text-sm tracking-[0.2em] text-muted-foreground">
                {initials}
              </span>
            </div>
          )}

          <ul className="mt-6 flex w-full max-w-sm list-none flex-col gap-2.5 p-0">
            <li className="text-telemetry">{facts.location}</li>
            <li className="text-telemetry">{facts.languages}</li>
            <li className="text-telemetry">{facts.availability}</li>
            {identity.email && (
              <li>
                <a
                  href={`mailto:${identity.email}`}
                  className="text-telemetry transition-colors hover:text-foreground"
                >
                  {identity.email}
                </a>
              </li>
            )}
          </ul>
        </aside>

        <div className="flex flex-col gap-8 md:gap-12">
          {sections.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={emptyTitle}
              description={emptyBody}
              action={emptyCta}
              className="self-start"
            />
          ) : (
            <>
              {sections.map((section, i) => (
                <Fragment key={section.id}>
                  <article className="flex flex-col gap-3">
                    <div className="flex items-baseline gap-3">
                      <span aria-hidden="true" className="text-telemetry">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {section.heading && (
                        <h2 className="text-h3">{section.heading}</h2>
                      )}
                    </div>
                    <div className="text-body-lg ml-9 whitespace-pre-line text-foreground/85">
                      {section.body}
                    </div>
                  </article>
                  {i === 1 && (
                    <blockquote className="text-h1 max-w-[24ch] text-balance py-4">
                      {pullQuote}
                    </blockquote>
                  )}
                </Fragment>
              ))}

              <div className="mt-2 flex flex-col gap-4">
                <h2 className="text-h3">{makerHeading}</h2>
                <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
                  {makerCells.map((cell) => (
                    <div key={cell.label} className="card-base flex flex-col gap-2">
                      <span className="text-telemetry text-foreground">
                        {cell.label}
                      </span>
                      <span className="text-body-sm text-muted-foreground">
                        {cell.line}
                      </span>
                    </div>
                  ))}
                  <Link
                    href={`/${locale}/uses`}
                    className="group card-base card-interactive flex flex-col gap-2 no-underline"
                  >
                    <span className="text-telemetry flex items-center justify-between text-foreground">
                      {makerUsesCell.label}
                      <ArrowRight
                        className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-body-sm text-muted-foreground">
                      {makerUsesCell.line}
                    </span>
                  </Link>
                </div>
              </div>

              <footer className="mt-4 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center">
                <Link href={primaryCta.href} className="btn-base btn-primary">
                  {primaryCta.label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href={secondaryCta.href} className="btn-base btn-ghost">
                  {secondaryCta.label}
                </Link>
              </footer>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

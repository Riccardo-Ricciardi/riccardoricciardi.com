import { Clock, ShieldCheck } from "lucide-react";
import { Heading } from "@/components/site/atoms/heading";

/**
 * LAYOUT EXCEPTION
 * ----------------
 * /contact is a conversion page, not a content page. Unlike Skills /
 * Projects / About / Work / Uses (which follow the left-default
 * pattern), the contact hero is intentionally centered with a
 * narrower column to focus the visitor on a single goal: writing a
 * message. Form readability constrains the form card to max-w-2xl
 * elsewhere; this hero matches that center alignment so the column
 * feels continuous.
 *
 * Keep this section centered. Do not migrate to the left-default
 * pattern.
 */

interface ContactProps {
  heading: string;
  eyebrow?: string;
  subtitle?: string;
  trust?: string;
  trustItems?: string[];
}

function splitTrust(trust?: string, fallback?: string[]): string[] {
  if (trust && trust.trim().length > 0) {
    return trust
      .split(/\s*·\s*|\s*\|\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return fallback ?? [];
}

export function Contact({
  heading,
  eyebrow,
  subtitle,
  trust,
  trustItems,
}: ContactProps) {
  const items = splitTrust(trust, trustItems);
  const icons = [Clock, ShieldCheck];

  return (
    <section
      aria-labelledby="contact-heading"
      className="container-page pt-20 md:pt-28 lg:pt-32"
    >
      <div className="content-narrow flex flex-col items-center text-center">
        <Heading
          level="h1"
          eyebrow={eyebrow}
          title={heading}
          subtitle={subtitle}
          align="center"
          id="contact-heading"
          className="mb-8"
        />

        {items.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {items.map((item, idx) => {
              const Icon = icons[idx] ?? Clock;
              return (
                <li key={`${item}-${idx}`}>
                  <span className="inline-flex items-center gap-2 rounded-pill border border-dashed-soft bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Icon
                      className="h-3.5 w-3.5 text-accent-blue"
                      aria-hidden="true"
                    />
                    {item}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

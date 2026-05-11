import { Clock, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/site/atoms/section-heading";

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
      className="container-page pt-16 md:pt-24 lg:pt-28"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="contact-heading"
        className="mb-8 md:mb-10"
      />

      {items.length > 0 && (
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {items.map((item, idx) => {
            const Icon = icons[idx] ?? Clock;
            return (
              <li key={`${item}-${idx}`} className="flex items-center gap-2">
                <Icon
                  className="h-3.5 w-3.5 text-accent-blue"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

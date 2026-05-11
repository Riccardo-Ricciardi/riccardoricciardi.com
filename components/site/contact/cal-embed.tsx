import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";

interface CalEmbedProps {
  username: string;
  eventSlug?: string;
  heading: string;
  description: string;
  ctaLabel: string;
}

export function CalEmbed({
  username,
  eventSlug = "30min",
  heading,
  description,
  ctaLabel,
}: CalEmbedProps) {
  const base = `https://cal.com/${username}/${eventSlug}`;
  const embedUrl = `${base}?embed=true&theme=auto&layout=month_view`;

  return (
    <div className="rounded-2xl border border-dashed border-dashed-soft bg-card overflow-hidden">
      <header className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-dashed border-dashed-soft text-accent-blue">
            <Calendar className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
              {heading}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Link
          href={base}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-lg border border-dashed border-dashed-soft bg-background px-3.5 text-sm font-medium transition-colors hover:border-accent-blue hover:text-accent-blue md:self-auto"
        >
          {ctaLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>
      <div className="aspect-[4/5] w-full border-t border-dashed border-dashed-soft sm:aspect-[5/4] md:aspect-[16/10]">
        <iframe
          src={embedUrl}
          title={heading}
          loading="lazy"
          className="h-full w-full"
          allow="payment"
        />
      </div>
    </div>
  );
}

import {
  ArrowUpRight,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
  Link as LinkIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSocialLinks } from "@/utils/social/fetch";
import { getSiteIdentity } from "@/utils/identity/fetch";

interface ContactSecondaryLinksProps {
  heading: string;
  emailLabel: string;
}

const KIND_ICON: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  twitter: Twitter,
  x: Twitter,
  instagram: Instagram,
};

function iconFor(kind: string): LucideIcon {
  return KIND_ICON[kind.toLowerCase()] ?? LinkIcon;
}

export async function ContactSecondaryLinks({
  heading,
  emailLabel,
}: ContactSecondaryLinksProps) {
  const [identity, links] = await Promise.all([
    getSiteIdentity(),
    getSocialLinks(),
  ]);

  const filteredLinks = links.filter(
    (l) => l.kind.toLowerCase() !== "email"
  );

  if (!identity.email && filteredLinks.length === 0) return null;

  return (
    <section
      aria-labelledby="contact-secondary-heading"
      className="container-page pb-16 md:pb-24"
    >
      <div className="mx-auto max-w-2xl">
        <p
          id="contact-secondary-heading"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {heading}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {identity.email && (
            <a
              href={`mailto:${identity.email}`}
              className="group flex items-center gap-3 rounded-lg border border-dashed-soft bg-card px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-accent-blue hover:shadow-[0_0_0_1px_var(--accent-blue-soft)]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-dashed-soft text-accent-blue">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {emailLabel}
                </span>
                <span className="truncate text-sm font-medium tracking-tight md:text-base">
                  {identity.email}
                </span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-blue"
                aria-hidden="true"
              />
            </a>
          )}

          {filteredLinks.map((link) => {
            const Icon = iconFor(link.kind);
            const external = /^https?:/i.test(link.url);
            const label =
              link.label ?? link.url.replace(/^https?:\/\/(www\.)?/, "");
            return (
              <a
                key={link.id}
                href={link.url}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-3 rounded-lg border border-dashed-soft bg-card px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-accent-blue hover:shadow-[0_0_0_1px_var(--accent-blue-soft)]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-dashed-soft text-foreground">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {link.kind}
                  </span>
                  <span className="truncate text-sm font-medium tracking-tight md:text-base">
                    {label}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-blue"
                  aria-hidden="true"
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

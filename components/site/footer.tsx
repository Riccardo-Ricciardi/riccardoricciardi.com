import { Github, Linkedin, Mail, Twitter, Instagram, Link as LinkIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSocialLinks } from "@/utils/social/fetch";
import { getSiteIdentity } from "@/utils/identity/fetch";

interface FooterProps {
  locale: string;
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

function hrefFor(kind: string, url: string): string {
  if (kind.toLowerCase() === "email" && !url.startsWith("mailto:")) {
    return `mailto:${url}`;
  }
  return url;
}

export async function Footer({ locale }: FooterProps) {
  const [links, identity] = await Promise.all([
    getSocialLinks(),
    getSiteIdentity(),
  ]);

  const year = new Date().getFullYear();
  const built =
    locale === "it"
      ? `Sviluppato da ${identity.name}`
      : `Built by ${identity.name}`;

  return (
    <footer className="section-divider-t mt-auto" role="contentinfo">
      <div className="container-page flex flex-row items-center justify-between gap-4 py-6 text-xs text-muted-foreground sm:text-sm">
        <p className="truncate">
          © {year} {built}.
        </p>
        {links.length > 0 && (
          <ul className="flex shrink-0 items-center gap-2 sm:gap-3">
            {links.map((link) => {
              const Icon = iconFor(link.kind);
              const href = hrefFor(link.kind, link.url);
              const external = /^https?:/i.test(href);
              return (
                <li key={link.id}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={link.label ?? link.kind}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Github, Linkedin, Mail, Twitter, Instagram, Link as LinkIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSocialLinks } from "@/utils/social/fetch";
import { getSiteIdentity } from "@/utils/identity/fetch";
import { getDictionary } from "@/utils/i18n/dictionary";
import { content, getContentBlocks } from "@/utils/content/fetch";

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
  const [links, identity, dictionary, blocks] = await Promise.all([
    getSocialLinks(),
    getSiteIdentity(),
    getDictionary(locale),
    getContentBlocks(locale),
  ]);

  const claim = content(blocks, "footer_claim", "");
  const navHeading = content(blocks, "footer_nav_heading", "");
  const connectHeading = content(blocks, "footer_connect_heading", "");

  const navItems = dictionary.navbar.toSorted((a, b) => a.position - b.position);
  const year = new Date().getFullYear();
  const built = content(blocks, "footer_built_by", "").replace(
    "{name}",
    identity.name
  );

  return (
    <footer className="section-divider-t relative z-10 mt-auto">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm font-medium tracking-tight text-foreground">
            riccardoricciardi
          </p>
          <p className="text-body-sm max-w-xs text-muted-foreground">{claim}</p>
        </div>

        <nav aria-label={navHeading} className="flex flex-col gap-3">
          <p className="text-eyebrow">{navHeading}</p>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.slug || "home"}>
                <Link
                  href={item.slug ? `/${locale}/${item.slug}` : `/${locale}`}
                  className="inline-flex min-h-9 items-center text-body-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          <p className="text-eyebrow">{connectHeading}</p>
          {links.length > 0 && (
            <ul className="flex flex-col gap-1">
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
                      className="inline-flex min-h-9 items-center gap-2 text-body-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {link.label ?? link.kind}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="section-divider-t">
        <div className="container-page py-5">
          <p className="text-telemetry">
            © {year} {built}
          </p>
        </div>
      </div>
    </footer>
  );
}

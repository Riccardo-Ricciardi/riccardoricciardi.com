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
import { SectionHeading } from "@/components/site/atoms/section-heading";

interface ContactProps {
  heading: string;
  eyebrow?: string;
  subtitle?: string;
  emailLabel: string;
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

export async function Contact({
  heading,
  eyebrow,
  subtitle,
  emailLabel,
}: ContactProps) {
  const [identity, links] = await Promise.all([
    getSiteIdentity(),
    getSocialLinks(),
  ]);

  return (
    <section
      aria-labelledby="contact-heading"
      className="container-page section-divider-b py-16 md:py-24 lg:py-28"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="contact-heading"
        className="mb-12 md:mb-16"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {identity.email && (
          <a
            href={`mailto:${identity.email}`}
            className="group flex flex-col gap-3 rounded-xl border border-dashed-soft bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent-blue hover:shadow-[0_0_0_1px_var(--accent-blue-soft)] sm:col-span-2"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-dashed-soft text-accent-blue">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <ArrowUpRight
                className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-blue"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {emailLabel}
              </p>
              <p className="mt-2 break-all text-xl font-medium tracking-tight md:text-2xl">
                {identity.email}
              </p>
            </div>
          </a>
        )}

        {links.map((link) => {
          const Icon = iconFor(link.kind);
          const isEmail = link.kind.toLowerCase() === "email";
          const href =
            isEmail && !link.url.startsWith("mailto:")
              ? `mailto:${link.url}`
              : link.url;
          const external = /^https?:/i.test(href);
          return (
            <a
              key={link.id}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="group flex flex-col gap-3 rounded-xl border border-dashed-soft bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent-blue hover:shadow-[0_0_0_1px_var(--accent-blue-soft)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-dashed-soft text-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-blue"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {link.kind}
                </p>
                <p className="mt-2 truncate text-lg font-medium tracking-tight md:text-xl">
                  {link.label ?? link.url.replace(/^https?:\/\/(www\.)?/, "")}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

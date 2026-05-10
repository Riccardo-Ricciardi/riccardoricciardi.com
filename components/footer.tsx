import { Github, Mail } from "lucide-react";
import { APP_CONFIG } from "@/utils/config/app";

interface FooterProps {
  locale: string;
}

const SOCIAL_LINKS = [
  { href: "https://github.com/Riccardo-Ricciardi", label: "GitHub", Icon: Github },
  { href: `mailto:${APP_CONFIG.author.email}`, label: "Email", Icon: Mail },
] as const;

export function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();
  const built =
    locale === "it"
      ? `Sviluppato da ${APP_CONFIG.author.name}`
      : `Built by ${APP_CONFIG.author.name}`;

  return (
    <footer className="section-divider-t mt-auto" role="contentinfo">
      <div className="container-page flex flex-row items-center justify-between gap-4 py-6 text-xs text-muted-foreground sm:text-sm">
        <p className="truncate">
          © {year} {built}.
        </p>
        <ul className="flex shrink-0 items-center gap-3 sm:gap-4">
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center rounded p-1 transition-colors hover:text-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={label}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

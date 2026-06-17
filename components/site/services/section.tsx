import Link from "next/link";
import { ArrowRight, Layers, Wrench, Workflow, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { Heading } from "@/components/site/atoms/heading";
import { Reveal } from "@/components/site/atoms/reveal";

export interface ServiceItem {
  id: string;
  title: string;
  body: string;
  primary?: boolean;
}

interface ServicesProps {
  eyebrow: string;
  heading: string;
  items: ServiceItem[];
  contactHref: string;
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "desktop-automation": Workflow,
  "full-stack-product": Layers,
  "integrations-rescue": Wrench,
};

// Illustrative command per playbook (technical token, not localized copy).
const SERVICE_CMD: Record<string, string> = {
  "desktop-automation": "automate --desktop",
  "full-stack-product": "ship --full-stack",
  "integrations-rescue": "rescue --integration",
};

export function Services({
  eyebrow,
  heading,
  items,
  contactHref,
}: ServicesProps) {
  if (items.length === 0) return null;

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="container-page section-divider-b section-y"
    >
      <Reveal variant="fade-up" className="mb-12">
        <Heading eyebrow={eyebrow} title={heading} id="services-heading" />
      </Reveal>

      <ul className="grid list-none gap-4 p-0 md:grid-cols-3">
        {items.map((item, index) => {
          const Icon = SERVICE_ICONS[item.id];
          const cmd = SERVICE_CMD[item.id];
          return (
            <Reveal as="li" key={item.id} variant="rise" delayMs={index * 90}>
              <Link
                href={contactHref}
                className={cn(
                  "card-base card-interactive card-pad-lg group relative flex h-full flex-col gap-3 overflow-hidden no-underline",
                  item.primary && "border-accent-blue"
                )}
              >
                <div className="flex items-start justify-between">
                  <span
                    aria-hidden="true"
                    className="font-mono text-h2 leading-none tabular-nums text-border transition-colors duration-300 group-hover:text-fg-subtle"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {Icon && (
                    <Icon
                      className={cn(
                        "transition-colors duration-150",
                        item.primary
                          ? "size-6 text-signal"
                          : "size-5 text-fg-subtle group-hover:text-foreground"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <h3 className={cn("text-h4 mt-1", item.primary && "text-h3")}>
                  {item.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>

                {cmd && (
                  <div className="mt-auto flex items-center gap-2 border-t border-border pt-3 font-mono text-[0.78rem]">
                    <span className="text-signal">$</span>
                    <span className="text-fg-subtle transition-colors duration-200 group-hover:text-foreground">
                      {cmd}
                    </span>
                    <ArrowRight
                      className="ml-auto size-3.5 text-fg-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-signal"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

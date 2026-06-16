import Link from "next/link";
import { Layers, Wrench, Workflow, type LucideIcon } from "lucide-react";
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
      <Heading
        eyebrow={eyebrow}
        title={heading}
        id="services-heading"
        className="mb-12"
      />

      <ul className="grid list-none gap-4 p-0 md:grid-cols-3">
        {items.map((item, index) => {
          const Icon = SERVICE_ICONS[item.id];
          return (
            <Reveal as="li" key={item.id} delayMs={index * 60}>
              <Link
                href={contactHref}
                className={cn(
                  "card-base card-interactive trace-card card-pad-lg group flex h-full flex-col gap-3 no-underline",
                  item.primary && "border-accent-blue"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "transition-colors duration-150",
                      item.primary
                        ? "size-7 text-signal"
                        : "size-5 text-fg-subtle group-hover:text-foreground"
                    )}
                    aria-hidden="true"
                  />
                )}
                <h3 className={cn("text-h4", item.primary && "text-h3")}>
                  {item.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

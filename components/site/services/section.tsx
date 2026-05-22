import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/site/atoms/section-heading";

interface ServiceItem {
  title: string;
  body: string;
  icon: LucideIcon;
}

interface ServicesProps {
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  items: ServiceItem[];
}

export function Services({ eyebrow, heading, subtitle, items }: ServicesProps) {
  if (items.length === 0) return null;

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="container-page section-divider-b section-y"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="services-heading"
        className="mb-12 md:mb-16"
      />

      <ul className="grid list-none gap-4 p-0 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.title}>
              <article className="card-base card-pad-lg flex h-full flex-col gap-4">
                <span className="grid size-12 place-items-center rounded-control border border-dashed-soft text-accent-blue">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-h4">{item.title}</h3>
                  <p className="text-body-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

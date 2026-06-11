import Link from "next/link";
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
  heading: string;
  items: ServiceItem[];
  contactHref: string;
}

export function Services({ heading, items, contactHref }: ServicesProps) {
  if (items.length === 0) return null;

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="container-page section-divider-b section-y"
    >
      <Heading title={heading} id="services-heading" className="mb-12" />

      <ul className="grid list-none gap-4 p-0 md:grid-cols-3">
        {items.map((item, index) => (
          <Reveal as="li" key={item.id} delayMs={index * 60}>
            <Link
              href={contactHref}
              className={cn(
                "card-base card-interactive card-pad-lg flex h-full flex-col gap-3 no-underline",
                item.primary &&
                  "border-l-2 border-l-accent-blue bg-accent-blue-soft"
              )}
            >
              <h3 className={cn("text-h4", item.primary && "text-h3")}>
                {item.title}
              </h3>
              <p className="text-body-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

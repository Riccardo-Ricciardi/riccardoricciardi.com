import { Heading } from "@/components/site/atoms/heading";
import { Reveal } from "@/components/site/atoms/reveal";
import { cn } from "@/utils/cn";

interface GroupLabels {
  languages: string;
  frontend: string;
  backend: string;
  hardware: string;
}

interface StackRowProps {
  eyebrow: string;
  heading: string;
  intro: string;
  groupLabels?: Partial<GroupLabels>;
}

interface StackItem {
  label: string;
  core?: boolean;
}

const FALLBACK_LABELS: GroupLabels = {
  languages: "Languages",
  frontend: "Frontend",
  backend: "Backend & Infra",
  hardware: "Hardware & QA",
};

const STACK_GROUPS: { key: keyof GroupLabels; items: StackItem[] }[] = [
  {
    key: "languages",
    items: [
      { label: "TypeScript", core: true },
      { label: "Python", core: true },
    ],
  },
  {
    key: "frontend",
    items: [
      { label: "Next.js", core: true },
      { label: "React" },
      { label: "Tailwind" },
    ],
  },
  {
    key: "backend",
    items: [
      { label: "Supabase", core: true },
      { label: "Node.js" },
      { label: "PostgreSQL" },
      { label: "Vercel" },
    ],
  },
  {
    key: "hardware",
    items: [
      { label: "Raspberry Pi" },
      { label: "ESP32" },
      { label: "Playwright" },
    ],
  },
];

export function StackRow({
  eyebrow,
  heading,
  intro,
  groupLabels,
}: StackRowProps) {
  const labels = { ...FALLBACK_LABELS, ...groupLabels };

  return (
    <section className="section-divider-b">
      <div className="container-page section-y flex flex-col gap-10">
        <Heading level="h2" eyebrow={eyebrow} title={heading} subtitle={intro} />

        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-surface)] border border-border bg-card px-6 py-8 sm:px-8">
            <div
              aria-hidden="true"
              className="bg-dots-fade pointer-events-none absolute inset-0"
            />
            <div className="relative flex flex-col gap-6">
              {STACK_GROUPS.map((group) => (
                <div
                  key={group.key}
                  className="flex flex-col gap-3 border-t border-border pt-6 first:border-t-0 first:pt-0 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <p className="text-eyebrow shrink-0 pt-1 sm:w-36">
                    {labels[group.key]}
                  </p>
                  <ul className="flex flex-wrap gap-2.5">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <span
                          className={cn(
                            "pill-base pill-mono pill-interactive",
                            item.core && "text-signal"
                          )}
                        >
                          {item.core && (
                            <>
                              <span
                                aria-hidden="true"
                                className="size-1.5 rounded-[1px] bg-accent-blue"
                              />
                              <span className="sr-only">core </span>
                            </>
                          )}
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
